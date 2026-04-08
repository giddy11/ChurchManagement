import { Router } from "express";
import {
  createChurch,
  getChurches,
  getChurchById,
  updateChurch,
  deleteChurch,
  createBranch,
  getBranches,
  updateBranch,
  deleteBranch,
} from "../controllers/church.controller";
import { authMiddleware, adminMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";
import type { RequestHandler } from "express";

const router = Router();
const auth = authMiddleware(new UserService()) as RequestHandler;

// ─── Denomination routes ──────────────────────────────────────────────────
router.get("/", auth, adminMiddleware, getChurches);
router.get("/:id", auth, adminMiddleware, getChurchById);
router.post("/", auth, adminMiddleware, createChurch);
router.put("/:id", auth, adminMiddleware, updateChurch);
router.delete("/:id", auth, adminMiddleware, deleteChurch);

// ─── Branch routes (nested under denomination) ────────────────────────────
router.get("/:id/branches", auth, adminMiddleware, getBranches);
router.post("/:id/branches", auth, adminMiddleware, createBranch);
router.put("/:id/branches/:branchId", auth, adminMiddleware, updateBranch);
router.delete("/:id/branches/:branchId", auth, adminMiddleware, deleteBranch);

export default router;
