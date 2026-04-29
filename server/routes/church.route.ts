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
  removeBranchMembers,
  checkDenominationName,
} from "../controllers/church.controller";
import {
  listBranchJoinRequests,
  reviewJoinRequest,
  bulkReviewJoinRequests,
  createInviteLink,
  listInviteLinks,
  deactivateInviteLink,
} from "../controllers/join.controller";
import {
  getBranchCustomDomain,
  upsertBranchCustomDomain,
  deleteBranchCustomDomain,
} from "../controllers/custom-domain.controller";
import { UserController } from "../controllers/user.controller";
import { authMiddleware, adminMiddleware, superAdminMiddleware } from "../middleware/auth.middleware";
import { UserService } from "../services/user.service";
import type { RequestHandler } from "express";

const router = Router();
const auth = authMiddleware(new UserService()) as RequestHandler;
const userController = new UserController();

// ─── Denomination routes ──────────────────────────────────────────────────
router.get("/check-name", checkDenominationName);
router.get("/", auth, adminMiddleware, getChurches);
router.get("/:id", auth, adminMiddleware, getChurchById);
router.post("/", auth, superAdminMiddleware, createChurch);
router.put("/:id", auth, adminMiddleware, updateChurch);
router.delete("/:id", auth, adminMiddleware, deleteChurch);

// ─── Branch routes (nested under denomination) ────────────────────────────
router.get("/:id/branches", auth, getBranches);
router.post("/:id/branches", auth, adminMiddleware, createBranch);
router.put("/:id/branches/:branchId", auth, adminMiddleware, updateBranch);
router.delete("/:id/branches/:branchId", auth, adminMiddleware, deleteBranch);

// ─── Branch member management ─────────────────────────────────────────────
router.post("/:churchId/branches/:branchId/members/:userId", auth, adminMiddleware, userController.addToBranch.bind(userController));
router.put("/:churchId/branches/:branchId/members/:userId/role", auth, adminMiddleware, userController.updateMemberBranchRole.bind(userController));
router.put("/:churchId/branches/:branchId/members/:userId/status", auth, adminMiddleware, userController.updateMemberBranchStatus.bind(userController));
router.delete("/:churchId/branches/:branchId/members", auth, adminMiddleware, removeBranchMembers);

// ─── Join requests (admin) ────────────────────────────────────────────────
router.get("/:churchId/branches/:branchId/join-requests", auth, adminMiddleware, listBranchJoinRequests);
router.put("/:churchId/branches/:branchId/join-requests/:requestId", auth, adminMiddleware, reviewJoinRequest);
router.post("/:churchId/branches/:branchId/join-requests/bulk-review", auth, adminMiddleware, bulkReviewJoinRequests);

// ─── Custom domain (admin) ────────────────────────────────────────────────
router.get("/:churchId/branches/:branchId/custom-domain", auth, getBranchCustomDomain);
router.put("/:churchId/branches/:branchId/custom-domain", auth, upsertBranchCustomDomain);
router.delete("/:churchId/branches/:branchId/custom-domain", auth, deleteBranchCustomDomain);

// ─── Invite links (admin) ─────────────────────────────────────────────────
router.get("/:churchId/branches/:branchId/invites", auth, adminMiddleware, listInviteLinks);
router.post("/:churchId/branches/:branchId/invites", auth, adminMiddleware, createInviteLink);
router.delete("/:churchId/branches/:branchId/invites/:inviteId", auth, adminMiddleware, deactivateInviteLink);

export default router;

