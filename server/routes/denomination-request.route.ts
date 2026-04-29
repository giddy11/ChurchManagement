import { Router } from "express";
import type { RequestHandler } from "express";
import {
  submitDenominationRequest,
  listDenominationRequests,
  getDenominationRequest,
  approveDenominationRequest,
  rejectDenominationRequest,
} from "../controllers/denomination-request.controller";
import { authMiddleware, superAdminMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user/user.service";

const router = Router();
const auth = authMiddleware(new UserService()) as RequestHandler;

// Public — no auth required
router.post("/", submitDenominationRequest);

// Super admin only
router.get("/", auth, superAdminMiddleware, listDenominationRequests);
router.get("/:id", auth, superAdminMiddleware, getDenominationRequest);
router.post("/:id/approve", auth, superAdminMiddleware, approveDenominationRequest);
router.post("/:id/reject", auth, superAdminMiddleware, rejectDenominationRequest);

export default router;
