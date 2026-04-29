import { AppDataSource } from "../../config/database";
import { CustomDomain, CustomDomainStatus, LandingConfig } from "../../models/church/custom-domain.model";
import { Branch } from "../../models/church/branch.model";
import { Denomination } from "../../models/church/denomination.model";
import { BranchMembership, BranchRole } from "../../models/church/branch-membership.model";
import { User } from "../../models/user.model";
import CustomError from "../../utils/customError";
import {
  sendCustomDomainRequestedToSuperAdmin,
  sendCustomDomainDecisionEmail,
  sendCustomDomainDeactivatedEmail,
} from "../../email/templates/email.custom_domain";

/**
 * Hostnames are normalised before comparison: lower-cased, trimmed,
 * any protocol or path stripped, and a leading "www." removed.
 * This guarantees a single canonical form per domain.
 */
export function normalizeDomain(raw: string | undefined | null): string {
  if (!raw) return "";
  let v = String(raw).trim().toLowerCase();
  v = v.replace(/^https?:\/\//, "");
  v = v.replace(/\/.*$/, "");
  v = v.replace(/:\d+$/, "");
  if (v.startsWith("www.")) v = v.slice(4);
  return v;
}

/** Strict RFC1035-style hostname validation (1–253 chars, labels ≤63). */
const DOMAIN_REGEX =
  /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

export function isValidDomain(d: string): boolean {
  return DOMAIN_REGEX.test(d);
}

const RESERVED_HOSTS = new Set([
  "localhost",
  "churchflow.app",
  "www.churchflow.app",
  "api.churchflow.app",
]);

export interface UpsertCustomDomainInput {
  domain: string;
  display_name?: string;
  logo_url?: string;
  church_name?: string;
  address?: string;
  pastor_name?: string;
  contact_email?: string;
  contact_phone?: string;
  tagline?: string;
  primary_color?: string;
  allow_self_signup?: boolean;
  /** Optional landing-page customisation. Pass `null` to clear. */
  landing_config?: LandingConfig | null;
}

export class CustomDomainService {
  private readonly repo = AppDataSource.getRepository(CustomDomain);
  private readonly branchRepo = AppDataSource.getRepository(Branch);
  private readonly denomRepo = AppDataSource.getRepository(Denomination);
  private readonly membershipRepo = AppDataSource.getRepository(BranchMembership);
  private readonly userRepo = AppDataSource.getRepository(User);

  // ─── Branch admin: submit / update request ─────────────────────────────

  async upsertForBranch(
    branchId: string,
    requesterId: string,
    input: UpsertCustomDomainInput,
  ): Promise<CustomDomain> {
    const branch = await this.branchRepo.findOne({
      where: { id: branchId },
      relations: ["denomination"],
    });
    if (!branch) throw new CustomError("Branch not found", 404);

    const domain = normalizeDomain(input.domain);
    if (!domain) throw new CustomError("Domain is required", 400);
    if (!isValidDomain(domain)) {
      throw new CustomError("Domain is not a valid hostname", 400);
    }
    if (RESERVED_HOSTS.has(domain)) {
      throw new CustomError("This domain is reserved", 400);
    }

    // A different branch already owns this domain?
    const existingForDomain = await this.repo.findOne({ where: { domain } });
    if (existingForDomain && existingForDomain.branch_id !== branchId) {
      throw new CustomError("This domain is already taken by another branch", 409);
    }

    const sanitized = this.sanitizeBranding(input, branch);
    let record = await this.repo.findOne({ where: { branch_id: branchId } });

    if (!record) {
      record = this.repo.create({
        domain,
        branch_id: branchId,
        denomination_id: branch.denomination_id,
        requested_by: requesterId,
        status: CustomDomainStatus.PENDING,
        ...sanitized,
      });
    } else {
      // Updating a previously rejected/inactive record re-opens the review.
      const reopen =
        record.status === CustomDomainStatus.REJECTED ||
        record.status === CustomDomainStatus.INACTIVE ||
        record.domain !== domain;

      record.domain = domain;
      Object.assign(record, sanitized);
      if (reopen) {
        record.status = CustomDomainStatus.PENDING;
        record.rejection_reason = null as any;
        record.reviewed_by = null as any;
        record.reviewed_at = null as any;
      }
    }

    const saved = await this.repo.save(record);
    this.notifySuperAdminsOfRequest(saved, branch).catch(() => {});
    return saved;
  }

  /**
   * Defensive copy of allowed branding fields with safe defaults from the
   * branch. Prevents accidental writes to unknown columns.
   */
  private sanitizeBranding(input: UpsertCustomDomainInput, branch: Branch) {
    return {
      display_name: (input.display_name || "").trim() || branch.name,
      church_name: (input.church_name || "").trim() || branch.name,
      address: input.address ?? branch.address ?? null,
      pastor_name: input.pastor_name ?? branch.pastor_name ?? null,
      logo_url: input.logo_url || null,
      contact_email: input.contact_email || null,
      contact_phone: input.contact_phone || null,
      tagline: input.tagline || null,
      primary_color: input.primary_color || null,
      allow_self_signup: input.allow_self_signup ?? true,
      landing_config: this.sanitizeLandingConfig(input.landing_config),
    } as Partial<CustomDomain>;
  }

  /**
   * Defensive copy of the landing-page config. Strips unknown keys, trims
   * strings, drops empty arrays/objects so the column stays small.
   */
  private sanitizeLandingConfig(
    raw: LandingConfig | null | undefined,
  ): LandingConfig | null {
    if (raw === null) return null;
    if (!raw || typeof raw !== "object") return null;

    const trim = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const trimOrNull = (v: unknown) => {
      const s = trim(v);
      return s ? s : undefined;
    };

    const services = Array.isArray(raw.service_times)
      ? raw.service_times
          .map((s) => ({
            label: trim(s?.label),
            day: trimOrNull(s?.day),
            time: trimOrNull(s?.time),
            background_image: this.sanitizeImageUrl(s?.background_image),
          }))
          .filter((s) => s.label.length > 0)
          .slice(0, 12)
      : undefined;

    const ministries = Array.isArray(raw.ministries)
      ? raw.ministries
          .map((m) => ({
            title: trim(m?.title),
            description: trimOrNull(m?.description),
            icon: trimOrNull(m?.icon),
            background_image: this.sanitizeImageUrl(m?.background_image),
          }))
          .filter((m) => m.title.length > 0)
          .slice(0, 12)
      : undefined;

    const gallery = Array.isArray(raw.gallery_urls)
      ? raw.gallery_urls
          .map((u) => trim(u))
          .filter((u) => /^https?:\/\//i.test(u))
          .slice(0, 24)
      : undefined;

    const highlights = Array.isArray(raw.highlights)
      ? raw.highlights
          .map((h) => {
            const images = Array.isArray(h?.images)
              ? h.images
                  .map((u) => trim(u))
                  .filter((u) => /^https?:\/\//i.test(u))
                  .slice(0, 30)
              : [];
            return {
              id: trimOrNull(h?.id),
              title: trim(h?.title),
              date: this.sanitizeIsoDate(h?.date),
              description: trimOrNull(h?.description),
              images,
            };
          })
          .filter((h) => h.title.length > 0 && h.images.length > 0)
          .slice(0, 50)
      : undefined;

    const coreValues = Array.isArray(raw.core_values)
      ? raw.core_values
          .map((c) => ({
            title: trim(c?.title),
            description: trimOrNull(c?.description),
            icon: trimOrNull(c?.icon),
            image: this.sanitizeImageUrl(c?.image),
          }))
          .filter((c) => c.title.length > 0)
          .slice(0, 12)
      : undefined;

    const social: LandingConfig["social"] = raw.social && typeof raw.social === "object"
      ? {
          facebook: trimOrNull(raw.social.facebook),
          instagram: trimOrNull(raw.social.instagram),
          youtube: trimOrNull(raw.social.youtube),
          twitter: trimOrNull(raw.social.twitter),
          whatsapp: trimOrNull(raw.social.whatsapp),
          website: trimOrNull(raw.social.website),
        }
      : undefined;

    const cleanedSocial =
      social && Object.values(social).some((v) => v) ? social : undefined;

    const config: LandingConfig = {
      hero_image_url: trimOrNull(raw.hero_image_url),
      hero_headline: trimOrNull(raw.hero_headline),
      hero_subheadline: trimOrNull(raw.hero_subheadline),
      cta_primary_label: trimOrNull(raw.cta_primary_label),
      about: trimOrNull(raw.about),
      service_times: services && services.length > 0 ? services : undefined,
      ministries: ministries && ministries.length > 0 ? ministries : undefined,
      gallery_urls: gallery && gallery.length > 0 ? gallery : undefined,
      highlights: highlights && highlights.length > 0 ? highlights : undefined,
      core_values: coreValues && coreValues.length > 0 ? coreValues : undefined,
      video_url: trimOrNull(raw.video_url),
      mission: trimOrNull(raw.mission),
      social: cleanedSocial,
      show_join_cta:
        typeof raw.show_join_cta === "boolean" ? raw.show_join_cta : undefined,
    };

    // If everything is empty, store null so we don't keep a {} blob.
    const hasAny = Object.values(config).some(
      (v) => v !== undefined && v !== null && v !== "",
    );
    return hasAny ? config : null;
  }

  /** Returns the URL only when it's an absolute http(s) URL; else undefined. */
  private sanitizeImageUrl(v: unknown): string | undefined {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    return /^https?:\/\//i.test(s) ? s : undefined;
  }

  /** Returns ISO YYYY-MM-DD when parseable; else undefined. */
  private sanitizeIsoDate(v: unknown): string | undefined {
    if (typeof v !== "string") return undefined;
    const s = v.trim();
    if (!s) return undefined;
    // Accept YYYY-MM-DD directly, or any Date.parse-able value.
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString().slice(0, 10);
  }

  // ─── Branch admin: read ────────────────────────────────────────────────

  async getForBranch(branchId: string): Promise<CustomDomain | null> {
    return this.repo.findOne({ where: { branch_id: branchId } });
  }

  async deleteForBranch(branchId: string): Promise<void> {
    const record = await this.repo.findOne({ where: { branch_id: branchId } });
    if (!record) throw new CustomError("No custom domain configured for this branch", 404);
    await this.repo.delete(record.id);
  }

  // ─── Super admin: list / approve / reject / deactivate ─────────────────

  async listAll(status?: CustomDomainStatus): Promise<CustomDomain[]> {
    return this.repo.find({
      where: status ? { status } : {},
      relations: ["branch", "denomination"],
      order: { created_at: "DESC" },
    });
  }

  async approve(id: string, reviewerId: string): Promise<CustomDomain> {
    const record = await this.findOrThrow(id);
    if (record.status === CustomDomainStatus.ACTIVE) {
      throw new CustomError("This domain is already active", 400);
    }
    record.status = CustomDomainStatus.ACTIVE;
    record.reviewed_by = reviewerId;
    record.reviewed_at = new Date();
    record.rejection_reason = null as any;
    const saved = await this.repo.save(record);
    this.notifyRequesterOfDecision(saved, "approved").catch(() => {});
    return saved;
  }

  async reject(id: string, reviewerId: string, reason: string): Promise<CustomDomain> {
    if (!reason || !reason.trim()) {
      throw new CustomError("A rejection reason is required", 400);
    }
    const record = await this.findOrThrow(id);
    record.status = CustomDomainStatus.REJECTED;
    record.reviewed_by = reviewerId;
    record.reviewed_at = new Date();
    record.rejection_reason = reason.trim();
    const saved = await this.repo.save(record);
    this.notifyRequesterOfDecision(saved, "rejected").catch(() => {});
    return saved;
  }

  async deactivate(id: string, reviewerId: string): Promise<CustomDomain> {
    const record = await this.findOrThrow(id);
    if (record.status !== CustomDomainStatus.ACTIVE) {
      throw new CustomError("Only active domains can be deactivated", 400);
    }
    record.status = CustomDomainStatus.INACTIVE;
    record.reviewed_by = reviewerId;
    record.reviewed_at = new Date();
    const saved = await this.repo.save(record);
    this.notifyRequesterOfDeactivation(saved).catch(() => {});
    return saved;
  }

  async reactivate(id: string, reviewerId: string): Promise<CustomDomain> {
    const record = await this.findOrThrow(id);
    if (record.status === CustomDomainStatus.ACTIVE) return record;
    record.status = CustomDomainStatus.ACTIVE;
    record.reviewed_by = reviewerId;
    record.reviewed_at = new Date();
    return this.repo.save(record);
  }

  // ─── Public: resolve domain → branding (no PII, no IDs that aren't needed)
  async resolvePublicBranding(host: string): Promise<{
    domain: string;
    display_name: string;
    logo_url: string | null;
    church_name: string;
    address: string | null;
    pastor_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    tagline: string | null;
    primary_color: string | null;
    allow_self_signup: boolean;
    branch_id: string;
    denomination_id: string;
    landing_config: LandingConfig | null;
  } | null> {
    const domain = normalizeDomain(host);
    if (!domain) return null;

    const record = await this.repo.findOne({
      where: { domain, status: CustomDomainStatus.ACTIVE },
    });
    if (!record) return null;
    return this._buildBrandingPayload(record);
  }

  /**
   * Like resolvePublicBranding but also tells the caller whether the domain
   * exists in the system but is currently inactive/deactivated.
   */
  async resolvePublicBrandingWithStatus(host: string): Promise<{
    branding: Awaited<ReturnType<CustomDomainService['resolvePublicBranding']>>;
    deactivated: boolean;
  }> {
    const domain = normalizeDomain(host);
    if (!domain) return { branding: null, deactivated: false };

    // Check ACTIVE first (fast path)
    const active = await this.repo.findOne({
      where: { domain, status: CustomDomainStatus.ACTIVE },
    });
    if (active) return { branding: this._buildBrandingPayload(active), deactivated: false };

    // Check whether the domain is known but inactive/rejected/pending
    const any = await this.repo.findOne({ where: { domain } });
    return { branding: null, deactivated: !!any };
  }

  private _buildBrandingPayload(record: CustomDomain): NonNullable<Awaited<ReturnType<CustomDomainService['resolvePublicBranding']>>> {
    return {
      domain: record.domain,
      display_name: record.display_name,
      logo_url: record.logo_url || null,
      church_name: record.church_name,
      address: record.address || null,
      pastor_name: record.pastor_name || null,
      contact_email: record.contact_email || null,
      contact_phone: record.contact_phone || null,
      tagline: record.tagline || null,
      primary_color: record.primary_color || null,
      allow_self_signup: record.allow_self_signup,
      branch_id: record.branch_id,
      denomination_id: record.denomination_id,
      landing_config: record.landing_config ?? null,
    };
  }

  /**
   * For trusted server-side use only — returns the full record matched by host
   * regardless of branding field shape. Auth flow uses this to scope a
   * domain-bound signup/login.
   */
  async findActiveByHost(host: string): Promise<CustomDomain | null> {
    const domain = normalizeDomain(host);
    if (!domain) return null;
    return this.repo.findOne({
      where: { domain, status: CustomDomainStatus.ACTIVE },
    });
  }

  // ─── Internals ─────────────────────────────────────────────────────────

  private async findOrThrow(id: string): Promise<CustomDomain> {
    const record = await this.repo.findOne({
      where: { id },
      relations: ["branch", "denomination"],
    });
    if (!record) throw new CustomError("Custom domain not found", 404);
    return record;
  }

  private async notifySuperAdminsOfRequest(record: CustomDomain, branch: Branch) {
    const superAdmins = await this.userRepo.find({ where: { role: "super_admin" as any } });
    const denomName = branch.denomination?.denomination_name ?? "";
    const requester = await this.userRepo.findOne({ where: { id: record.requested_by } });
    for (const sa of superAdmins) {
      if (sa.email) {
        sendCustomDomainRequestedToSuperAdmin(
          sa.email,
          record.domain,
          branch.name,
          denomName,
          requester?.email ?? "unknown",
        ).catch(() => {});
      }
    }
  }

  private async notifyRequesterOfDecision(
    record: CustomDomain,
    decision: "approved" | "rejected",
  ) {
    const requester = await this.userRepo.findOne({ where: { id: record.requested_by } });
    if (!requester?.email) return;
    const branchName = record.branch?.name ?? record.display_name;
    await sendCustomDomainDecisionEmail(
      requester.email,
      record.domain,
      branchName,
      decision,
      record.rejection_reason || undefined,
    );

    // Also notify all current branch admins.
    const adminMemberships = await this.membershipRepo.find({
      where: { branch_id: record.branch_id, role: BranchRole.ADMIN, is_active: true },
      relations: ["user"],
    });
    for (const m of adminMemberships) {
      if (m.user?.email && m.user.email !== requester.email) {
        sendCustomDomainDecisionEmail(
          m.user.email, record.domain, branchName, decision, record.rejection_reason || undefined,
        ).catch(() => {});
      }
    }
  }

  private async notifyRequesterOfDeactivation(record: CustomDomain) {
    const requester = await this.userRepo.findOne({ where: { id: record.requested_by } });
    if (!requester?.email) return;
    const branchName = record.branch?.name ?? record.display_name;
    await sendCustomDomainDeactivatedEmail(requester.email, record.domain, branchName);
  }
}
