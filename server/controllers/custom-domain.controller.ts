import { Request, Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import asyncHandler from "../utils/asyncHandler";
import CustomError from "../utils/customError";
import { CustomDomainService, normalizeDomain } from "../services/church/custom-domain.service";
import { CustomDomainStatus } from "../models/church/custom-domain.model";
import { AppDataSource } from "../config/database";
import { BranchMembership, BranchRole } from "../models/church/branch-membership.model";

const service = new CustomDomainService();

/**
 * Branch admin guard: the authenticated user must be a global admin of the
 * denomination, a super-admin, or hold an admin membership in the target branch.
 */
async function ensureBranchAdmin(req: AuthRequest, branchId: string): Promise<void> {
  if (req.user.role === "super_admin") return;

  const denomIds = req.user.denominationIds ?? [];
  if (req.user.role === "admin" && denomIds.length > 0) {
    // Verify the branch belongs to one of the user's denominations.
    const branchRepo = AppDataSource.getRepository("branches");
    const branch: any = await branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new CustomError("Branch not found", 404);
    if (denomIds.includes(branch.denomination_id)) return;
  }

  const membershipRepo = AppDataSource.getRepository(BranchMembership);
  const membership = await membershipRepo.findOne({
    where: { user_id: req.user.id, branch_id: branchId, role: BranchRole.ADMIN, is_active: true },
  });
  if (!membership) {
    throw new CustomError("You do not have permission to manage this branch", 403);
  }
}

// ─── Branch admin endpoints ───────────────────────────────────────────────

export const getBranchCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { branchId } = req.params;
  await ensureBranchAdmin(authReq, branchId);
  const record = await service.getForBranch(branchId);
  res.json({ status: 200, data: record });
});

export const upsertBranchCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { branchId } = req.params;
  await ensureBranchAdmin(authReq, branchId);
  const record = await service.upsertForBranch(branchId, authReq.user.id, req.body);
  res.status(200).json({
    status: 200,
    data: record,
    message:
      record.status === CustomDomainStatus.PENDING
        ? "Custom domain saved. Awaiting super admin approval."
        : "Custom domain saved.",
  });
});

export const deleteBranchCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { branchId } = req.params;
  await ensureBranchAdmin(authReq, branchId);
  await service.deleteForBranch(branchId);
  res.json({ status: 200, message: "Custom domain removed." });
});

// ─── Super admin endpoints ────────────────────────────────────────────────

export const listAllCustomDomains = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as CustomDomainStatus | undefined;
  const records = await service.listAll(status);
  res.json({ status: 200, data: records });
});

export const approveCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const record = await service.approve(req.params.id, authReq.user.id);
  res.json({ status: 200, data: record, message: "Custom domain approved." });
});

export const rejectCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { rejection_reason } = req.body ?? {};
  const record = await service.reject(req.params.id, authReq.user.id, rejection_reason);
  res.json({ status: 200, data: record, message: "Custom domain rejected." });
});

export const deactivateCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const record = await service.deactivate(req.params.id, authReq.user.id);
  res.json({ status: 200, data: record, message: "Custom domain deactivated." });
});

export const reactivateCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const record = await service.reactivate(req.params.id, authReq.user.id);
  res.json({ status: 200, data: record, message: "Custom domain reactivated." });
});

// ─── Public resolver (no auth) ────────────────────────────────────────────

export const resolvePublicCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const host = (req.params.host as string) || "";
  const { branding, deactivated } = await service.resolvePublicBrandingWithStatus(host);
  res.json({ status: 200, data: branding, deactivated });
});

/** Convenience: resolve based on the request's Host header / X-Custom-Domain. */
export const resolveSelfCustomDomain = asyncHandler(async (req: Request, res: Response) => {
  const explicit = (req.headers["x-custom-domain"] as string | undefined) || "";
  const host = explicit || req.headers.host || "";
  const branding = await service.resolvePublicBranding(normalizeDomain(host));
  res.json({ status: 200, data: branding });
});
