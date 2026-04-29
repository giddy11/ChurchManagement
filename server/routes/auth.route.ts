import { RequestHandler, Router } from "express";
import {
  login,
  forgotPassword,
  register,
  firebaseLogin,
  verifyResetOtp,
  setNewPassword,
  changePassword,
  googleSignIn,
  googleAuthStart,
  googleAuthCallback,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import { UserService } from "../services/user/user.service";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", register);
router.post("/login", firebaseLogin);
router.post("/firebase-login", firebaseLogin);
router.post("/google", googleSignIn);
// Server-side Google OAuth code flow — used by custom domains so the
// JavaScript origin doesn't need to be registered with Google per tenant.
router.get("/google/start", googleAuthStart);
router.get("/google/callback", googleAuthCallback);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/set-new-password", setNewPassword);
router.post(
  "/change-password",
  authMiddleware(new UserService()) as RequestHandler,
  changePassword
);

export default router;