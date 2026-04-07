import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth.middleware";
import { getPermissionsForRole } from "../utils/roles";

const authService = new AuthService();

const IS_PROD = process.env.NODE_ENV === 'development';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? ('none' as const) : ('lax' as const),
  path: '/',
};

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie('refresh_token', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', COOKIE_OPTIONS);
  res.clearCookie('refresh_token', COOKIE_OPTIONS);
}

function buildAuthResponse(result: { user: any; tokens: any }) {
  const roleName = result.user.role || 'member';
  const permissions = getPermissionsForRole(roleName);

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      full_name: result.user.full_name,
      profile_img: result.user.profile_img,
    },
    role: { name: roleName },
    permissions,
  };
}

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { idToken, full_name, denomination_name, description, location, state, country, address } = req.body;
    if (!idToken || !full_name) {
      res.status(400).json({
        status: 400,
        message: "All fields are required: idToken, full_name",
      });
      return;
    }
    if (!denomination_name) {
      res.status(400).json({
        status: 400,
        message: "Church denomination name is required",
      });
      return;
    }

    const result = await authService.register(idToken, full_name, {
      denomination_name,
      description,
      location,
      state,
      country,
      address,
    });

    const roleName = result.user.role || 'admin';
    const permissions = getPermissionsForRole(roleName as string);

    res.status(201).json({
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          full_name: result.user.full_name,
          profile_img: result.user.profile_img,
        },
        church: {
          id: result.church.id,
          denomination_name: result.church.denomination_name,
          description: result.church.description,
          location: result.church.location,
          state: result.church.state,
          country: result.church.country,
          address: result.church.address,
        },
        role: { name: roleName },
        permissions,
      },
      status: 201,
      message: "Registration successful.",
    });
  }
);

export const firebaseLogin = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({ status: 400, message: "Firebase ID token is required" });
      return;
    }

    const result = await authService.firebaseLogin(idToken);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    res.status(200).json({
      data: buildAuthResponse(result),
      status: 200,
      message: "Login successful",
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        status: 400,
        message: "Email and password are required",
      });
      return;
    }

    const result = await authService.login(email, password);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    res.status(200).json({
      data: buildAuthResponse(result),
      status: 200,
      message: "Login successful",
    });
  }
);

export const googleSignIn = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { idToken } = req.body;
    if (!idToken) {
      res.status(400).json({
        status: 400,
        message: "Google ID token is required",
      });
      return;
    }

    const result = await authService.googleSignIn(idToken);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    res.status(200).json({
      data: { ...buildAuthResponse(result), isNewUser: result.isNewUser },
      status: 200,
      message: result.isNewUser
        ? "Account created via Google"
        : "Google sign-in successful",
    });
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refresh_token || req.body?.refreshToken;
    if (!token) {
      res.status(400).json({
        status: 400,
        message: "Refresh token is required",
      });
      return;
    }

    const result = await authService.refreshTokens(token);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    res.status(200).json({
      data: buildAuthResponse(result),
      status: 200,
      message: "Token refreshed",
    });
  }
);

export const logout = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id;
    if (userId) {
      await authService.revokeRefreshToken(userId);
    }
    clearAuthCookies(res);
    res.status(200).json({ status: 200, message: "Logged out successfully" });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ status: 400, message: "Email is required" });
      return;
    }

    const result = await authService.initiatePasswordReset(email);

    res.status(200).json({
      data: { otpSent: result.otpSent },
      status: 200,
      message: result.otpSent
        ? "If the email exists, an OTP has been sent"
        : "OTP generated but email could not be sent.",
    });
  }
);

export const verifyResetOtp = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res
        .status(400)
        .json({ status: 400, message: "Email and OTP are required" });
      return;
    }

    const { isValid } = await authService.verifyPasswordResetOtp(email, otp);

    res.status(200).json({
      data: { isValid },
      status: 200,
      message: isValid ? "OTP is valid" : "OTP is invalid",
    });
  }
);

export const setNewPassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      res.status(400).json({
        status: 400,
        message: "Email and new password are required",
      });
      return;
    }

    const result = await authService.setNewPassword(email, newPassword);
    res.status(200).json({
      data: result,
      status: 200,
      message: "Password has been reset successfully",
    });
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id || req.body.userId;
    const { oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      res.status(400).json({
        status: 400,
        message: "userId, oldPassword, and newPassword are required",
      });
      return;
    }

    const result = await authService.changePassword(
      userId,
      oldPassword,
      newPassword
    );
    res.status(200).json({
      data: result,
      status: 200,
      message: "Password changed successfully",
    });
  }
);
