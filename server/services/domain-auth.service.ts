import { Request } from "express";
import { AppDataSource } from "../config/database";
import { BranchMembership } from "../models/church/branch-membership.model";
import { BranchJoinRequest } from "../models/church/branch-join-request.model";
import { CustomDomainService, normalizeDomain } from "./custom-domain.service";

const customDomainService = new CustomDomainService();

/**
 * Resolve the request's custom domain (X-Custom-Domain header preferred,
 * falling back to the Host header so production deployments behind a proxy
 * work without explicit client cooperation).
 */
export async function resolveCustomDomainFromRequest(req: Request) {
  const explicit = (req.headers["x-custom-domain"] as string | undefined) || "";
  const fallback = (req.headers.host as string | undefined) || "";
  const host = normalizeDomain(explicit || fallback);
  if (!host) return null;
  return customDomainService.findActiveByHost(host);
}

export interface AutoJoinResult {
  branch_id: string;
  denomination_id: string;
  domain: string;
  /** Final state for the user with respect to the domain's branch. */
  membership_status: "member" | "pending" | "rejected" | "request_created";
}

/**
 * If the request originated from an active custom domain and the user is
 * not yet a member of that branch, create / surface a pending join request.
 *
 * Idempotent: re-running for the same user yields the existing state.
 */
export async function autoJoinFromCustomDomain(
  req: Request,
  userId: string,
): Promise<AutoJoinResult | null> {
  const domain = await resolveCustomDomainFromRequest(req);
  if (!domain) return null;

  const membershipRepo = AppDataSource.getRepository(BranchMembership);
  const requestRepo = AppDataSource.getRepository(BranchJoinRequest);

  const membership = await membershipRepo.findOne({
    where: { user_id: userId, branch_id: domain.branch_id },
  });
  if (membership && membership.is_active) {
    return {
      branch_id: domain.branch_id,
      denomination_id: domain.denomination_id,
      domain: domain.domain,
      membership_status: "member",
    };
  }

  const existing = await requestRepo.findOne({
    where: { user_id: userId, branch_id: domain.branch_id },
  });

  if (existing) {
    if (existing.status === "approved") {
      return {
        branch_id: domain.branch_id,
        denomination_id: domain.denomination_id,
        domain: domain.domain,
        membership_status: "member",
      };
    }
    if (existing.status === "rejected") {
      return {
        branch_id: domain.branch_id,
        denomination_id: domain.denomination_id,
        domain: domain.domain,
        membership_status: "rejected",
      };
    }
    return {
      branch_id: domain.branch_id,
      denomination_id: domain.denomination_id,
      domain: domain.domain,
      membership_status: "pending",
    };
  }

  if (!domain.allow_self_signup) {
    return {
      branch_id: domain.branch_id,
      denomination_id: domain.denomination_id,
      domain: domain.domain,
      membership_status: "rejected",
    };
  }

  // Lazy-import to avoid a circular import with join.service ↔ email modules.
  const { JoinService } = await import("./join.service");
  const join = new JoinService();
  try {
    await join.submitJoinRequest(userId, domain.branch_id, "Auto-submitted via custom domain sign-in");
  } catch {
    // Race condition or already-member — fall through and let the next
    // call return the up-to-date state.
  }

  return {
    branch_id: domain.branch_id,
    denomination_id: domain.denomination_id,
    domain: domain.domain,
    membership_status: "request_created",
  };
}
