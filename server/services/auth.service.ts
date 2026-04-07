import { User } from "../models/user.model";
import { AppDataSource } from "../config/database";
import bcrypt from "bcrypt";
import * as speakeasy from "speakeasy";
import { sendPasswordResetOtpEmail } from "../email/sendPasswordResetOtpEmail";
import { Role } from "../models/role-permission/role.model";
import { TokenService } from "./token.service";
import { GoogleAuthService, GoogleProfile } from "./google-auth.service";

type UserResponse = Omit<
  User,
  "password_hash" | "otp_hash" | "hashPassword" | "validatePassword"
>;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly tokenService = new TokenService();
  private readonly googleAuthService = new GoogleAuthService();

  private async isFirstUser(): Promise<boolean> {
    const userCount = await this.userRepository.count();
    return userCount === 0;
  }

  private stripSensitiveFields(user: User): UserResponse {
    const {
      password_hash: _,
      otp_hash: __,
      otp_secret: ___,
      reset_password_token: ____,
      refresh_token_hash: _____,
      ...safe
    } = user;
    return safe as UserResponse;
  }

  private async saveRefreshToken(user: User, refreshToken: string): Promise<void> {
    user.refresh_token_hash = this.tokenService.hashToken(refreshToken);
    await this.userRepository.save(user);
  }

  private async findUserWithRelations(where: Record<string, any>): Promise<User | null> {
    try {
      return await this.userRepository.findOne({
        where,
        relations: ["role", "role.permissions", "groups", "groups.permissions", "permissions", "department"],
      });
    } catch (error: any) {
      if (error?.code === "42P01" || error?.message?.includes("user_groups")) {
        return await this.userRepository.findOne({
          where,
          relations: ["role", "role.permissions", "permissions", "department"],
        });
      }
      throw error;
    }
  }


  async register(
    email: string,
    full_name: string,
    password: string
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    if (!email || !full_name || !password) {
      throw new Error("All fields are required");
    }
    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email }],
      relations: ["role"],
    });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const role = await this.findAdminRole();
    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      email: email.toLowerCase().trim(),
      full_name: full_name.trim(),
      password_hash: passwordHash,
      role,
    });

    const savedUser = await this.userRepository.save(user);
    const completeUser = await this.findUserWithRelations({ id: savedUser.id });
    if (!completeUser) throw new Error("Failed to fetch complete user data");

    const tokens = this.tokenService.generateTokenPair(completeUser);
    await this.saveRefreshToken(completeUser, tokens.refreshToken);

    return { user: this.stripSensitiveFields(completeUser), tokens };
  }

  private async findAdminRole(): Promise<Role> {
    const roleRepository = AppDataSource.getRepository(Role);
    const role = await roleRepository.findOne({
      where: { name: "admin" },
      relations: ["permissions"],
    });
    if (!role) {
      throw new Error("Admin role not found. Please run seed scripts first.");
    }
    if (!role.permissions || role.permissions.length === 0) {
      throw new Error("Admin role has no permissions. Run seed:roles.");
    }
    return role;
  }

  async login(
    email: string,
    password: string
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await this.findUserWithRelations({ email });
    if (!user) throw new Error("Invalid email or password.");
    if (!user.password_hash) throw new Error("Password not set for this account.");

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) throw new Error("Invalid email or password");
    if (!user.is_active) throw new Error("Account is deactivated. Please contact an administrator.");

    const tokens = this.tokenService.generateTokenPair(user);
    await this.saveRefreshToken(user, tokens.refreshToken);

    return { user: this.stripSensitiveFields(user), tokens };
  }

  async googleSignIn(
    idToken: string
  ): Promise<{ user: UserResponse; tokens: AuthTokens; isNewUser: boolean }> {
    const profile = await this.googleAuthService.verifyIdToken(idToken);
    let user = await this.findUserWithRelations({ google_id: profile.googleId });
    let isNewUser = false;

    if (!user) {
      user = await this.findUserWithRelations({ email: profile.email });
      if (user) {
        user.google_id = profile.googleId;
        if (!user.profile_img && profile.profileImg) {
          user.profile_img = profile.profileImg;
        }
        await this.userRepository.save(user);
      }
    }

    if (!user) {
      user = await this.createGoogleUser(profile);
      isNewUser = true;
    }

    if (!user.is_active) throw new Error("Account is deactivated.");

    const tokens = this.tokenService.generateTokenPair(user);
    await this.saveRefreshToken(user, tokens.refreshToken);

    return { user: this.stripSensitiveFields(user), tokens, isNewUser };
  }

  private async createGoogleUser(profile: GoogleProfile): Promise<User> {
    const newUser = this.userRepository.create({
      email: profile.email.toLowerCase().trim(),
      full_name: profile.fullName,
      first_name: profile.firstName,
      last_name: profile.lastName,
      google_id: profile.googleId,
      profile_img: profile.profileImg,
      is_active: true,
    });
    const savedUser = await this.userRepository.save(newUser);
    return (await this.findUserWithRelations({ id: savedUser.id }))!;
  }

  async refreshTokens(
    refreshToken: string
  ): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.findUserWithRelations({ id: payload.id });
    if (!user) throw new Error("User not found");
    if (!user.is_active) throw new Error("Account is deactivated.");

    const tokenHash = this.tokenService.hashToken(refreshToken);
    if (user.refresh_token_hash !== tokenHash) {
      throw new Error("Invalid refresh token");
    }

    const tokens = this.tokenService.generateTokenPair(user);
    await this.saveRefreshToken(user, tokens.refreshToken);

    return { user: this.stripSensitiveFields(user), tokens };
  }

  async revokeRefreshToken(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.refresh_token_hash = "";
      await this.userRepository.save(user);
    }
  }

  async verifyTwoFactorCode(
    email: string,
    code: string
  ): Promise<{ tokens: AuthTokens; user: UserResponse }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !user.two_factor_code) {
      throw new Error("Invalid email or no 2FA code requested.");
    }
    if (new Date() > user.two_factor_code_expires_at!) {
      throw new Error("2FA code has expired.");
    }

    const isValid = await bcrypt.compare(code, user.two_factor_code);
    if (!isValid) throw new Error("Invalid 2FA code.");
    if (!user.is_active) throw new Error("Account is deactivated.");

    user.two_factor_code = null;
    user.two_factor_code_expires_at = null;
    await this.userRepository.save(user);

    const tokens = this.tokenService.generateTokenPair(user);
    await this.saveRefreshToken(user, tokens.refreshToken);

    return { tokens, user: this.stripSensitiveFields(user) };
  }

  async initiatePasswordReset(email: string): Promise<{ otpSent: boolean }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return { otpSent: true };
    }

    // Generate OTP
    const otpSecret = speakeasy.generateSecret({ length: 20 });
    const otp = speakeasy.totp({
      secret: otpSecret.base32,
      encoding: "base32",
    });
    const otpHash = await bcrypt.hash(otp, 10);

    user.otp_secret = otpSecret.base32;
    user.otp_hash = otpHash;
    await this.userRepository.save(user);

    // Log OTP for debugging (remove in production)
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`🔐 OTP GENERATED FOR PASSWORD RESET`);
    console.log(`   Email: ${email}`);
    console.log(`   OTP Code: ${otp}`);
    console.log(`   OTP Hash: ${otpHash.substring(0, 20)}...`);
    console.log(`   Expires in: 10 minutes`);
    console.log(`═══════════════════════════════════════════════════════════\n`);

    let emailSent = false;
    try {
      console.log(`📧 Sending password reset email to: ${email}`);
      const emailResult = await sendPasswordResetOtpEmail(email, otp);
      if (emailResult) {
        emailSent = true;
        console.log(`✅ Password reset email sent successfully to: ${email}`);
      } else {
        console.error('❌ Email service returned null - email was not sent');
        console.error('   This usually means SMTP ports are blocked by firewall/network');
        console.error(`   OTP Code: ${otp} (use this code to reset password)`);
      }
    } catch (error: any) {
      console.error('❌ Failed to send password reset email:', error);
      console.error('   Error details:', {
        message: error.message,
        code: error.code,
        command: error.command,
        response: error.response,
      });
      console.error(`   OTP Code: ${otp} (use this code to reset password)`);
    }

    return { otpSent: emailSent };
  }

    async verifyPasswordResetOtp(email: string, otp: string): Promise<{ isValid: boolean }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.otp_hash) {
      throw new Error("No OTP requested for this user");
    }

    const isValidOtp = await bcrypt.compare(otp, user.otp_hash);
    return {
      isValid: isValidOtp,
    };
  }

  async setNewPassword(email: string, newPassword: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.otp_hash) {
      throw new Error("OTP verification required");
    }
    if (newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }
    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.otp_hash = "";
    user.otp_secret = "";
    await this.userRepository.save(user);
    return { success: true };
  }
  /**
   * Change password for authenticated user
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ success: boolean }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      throw new Error("Old password is incorrect");
    }
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }
    user.password_hash = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { success: true };
  }
}
