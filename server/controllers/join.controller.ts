import { Request, Response } from "express";
import { JoinService } from "../services/join.service";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../middleware/auth.middleware";

const joinService = new JoinService();

// ─── Public: list all denominations with their branches ───────────────────
export const listPublicDenominations = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const denominations = await joinService.listDenominationsWithBranches();
    res.json({ status: 200, data: denominations });
  }
);

// ─── Public: get branch info from invite code ─────────────────────────────
export const getInviteInfo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { code } = req.params;
    const { invite, branch, denomination } = await joinService.resolveInvite(code);
    res.json({
      status: 200,
      data: {
        code: invite.code,
        branch: { id: branch.id, name: branch.name, city: branch.city, country: branch.country },
        denomination: { id: denomination.id, denomination_name: denomination.denomination_name },
        expires_at: invite.expires_at,
        max_uses: invite.max_uses,
        uses_count: invite.uses_count,
      },
    });
  }
);

// ─── Authenticated: submit a join request ────────────────────────────────
export const submitJoinRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id;
    const { branch_id, message } = req.body;
    if (!branch_id) {
      res.status(400).json({ status: 400, message: "branch_id is required" });
      return;
    }
    const request = await joinService.submitJoinRequest(userId, branch_id, message);
    res.status(201).json({ status: 201, data: request, message: "Join request submitted. Awaiting admin approval." });
  }
);

// ─── Authenticated: use invite code ──────────────────────────────────────
export const useInviteCode = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const userId = (req as AuthRequest).user?.id;
    const { code } = req.params;
    const membership = await joinService.useInvite(code, userId);
    res.status(201).json({ status: 201, data: membership, message: "You have successfully joined the branch." });
  }
);

// ─── Admin: list join requests for a branch ──────────────────────────────
export const listBranchJoinRequests = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { branchId } = req.params;
    const status = req.query.status as "pending" | "approved" | "rejected" | undefined;
    const requests = await joinService.listRequestsForBranch(branchId, status);
    res.json({ status: 200, data: requests });
  }
);

// ─── Admin: approve or reject a join request ─────────────────────────────
export const reviewJoinRequest = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const reviewerId = (req as AuthRequest).user?.id;
    const { requestId } = req.params;
    const { decision } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      res.status(400).json({ status: 400, message: "decision must be 'approved' or 'rejected'" });
      return;
    }
    const updated = await joinService.reviewRequest(requestId, decision, reviewerId);
    res.json({ status: 200, data: updated, message: `Request ${decision}.` });
  }
);

// ─── Admin: create invite link ────────────────────────────────────────────
export const createInviteLink = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const createdBy = (req as AuthRequest).user?.id;
    const { churchId, branchId } = req.params;
    const { expires_at, max_uses } = req.body;
    const invite = await joinService.createInvite({
      branchId,
      denominationId: churchId,
      createdBy,
      expiresAt: expires_at ? new Date(expires_at) : undefined,
      maxUses: max_uses ? Number(max_uses) : undefined,
    });
    res.status(201).json({ status: 201, data: invite, message: "Invite link created." });
  }
);

// ─── Admin: list invite links for a branch ────────────────────────────────
export const listInviteLinks = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { branchId } = req.params;
    const invites = await joinService.listInvitesForBranch(branchId);
    res.json({ status: 200, data: invites });
  }
);

// ─── Admin: deactivate an invite link ────────────────────────────────────
export const deactivateInviteLink = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { branchId, inviteId } = req.params;
    await joinService.deactivateInvite(inviteId, branchId);
    res.json({ status: 200, message: "Invite link deactivated." });
  }
);
