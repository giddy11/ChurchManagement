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