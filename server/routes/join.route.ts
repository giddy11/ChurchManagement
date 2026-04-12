import { Router } from "express";
import type { RequestHandler } from "express";
import {
  listPublicDenominations,
  getInviteInfo,
  submitJoinRequest,
  useInviteCode,
} from "../controllers/join.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";

const router = Router();
const auth = authMiddleware(new UserService()) as RequestHandler;

// Public — no auth required
router.get("/churches", listPublicDenominations);
router.get("/invite/:code", getInviteInfo);

// Authenticated user actions
router.post("/request", auth, submitJoinRequest);
router.post("/invite/:code/use", auth, useInviteCode);

export default router;
