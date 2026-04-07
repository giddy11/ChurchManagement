import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppDataSource } from "../config/database";
import { User } from "../models/user.model";

const authService = new AuthService();

function buildAuthResponse(result: { user: any; tokens: any }) {
  const rolePermissions = result.user.role?.permissions || [];
  const groupPermissions = (result.user.groups || []).flatMap(
    (g: any) => g.permissions || []
  );
  const individualPermissions = result.user.permissions || [];

  return {
    user: {
      id: result.user.id,
      email: result.user.email,
      full_name: result.user.full_name,
      profile_img: result.user.profile_img,
    },
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
    role: result.user.role,
    groups: result.user.groups || [],
    permissions: individualPermissions,
    effectivePermissions: [
      ...rolePermissions.map((p: any) => p.name || p.id),
      ...groupPermissions.map((p: any) => p.name || p.id),
      ...individualPermissions.map((p: any) => p.name || p.id),
    ],
  };
}

export const register = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userRepository = AppDataSource.getRepository(User);
    const userCount = await userRepository.count();

    if (userCount > 0) {
      res.status(403).json({
        status: 403,
        message: "Public registration is disabled. Contact your administrator.",
      });
      return;
    }

    const { email, full_name, password } = req.body;
    if (!email || !full_name || !password) {
      res.status(400).json({
        status: 400,
        message: "All fields are required: email, full_name, password",
      });
      return;
    }

    const result = await authService.register(email, full_name, password);

    res.status(201).json({
      data: buildAuthResponse(result),
      status: 201,
      message: "Admin account created successfully.",
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
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({
        status: 400,
        message: "Refresh token is required",
      });
      return;
    }

    const result = await authService.refreshTokens(refreshToken);

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
