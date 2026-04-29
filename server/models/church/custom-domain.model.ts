import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Branch } from "./branch.model";
import { Denomination } from "./denomination.model";

export enum CustomDomainStatus {
  PENDING = "pending",
  ACTIVE = "active",
  INACTIVE = "inactive",
  REJECTED = "rejected",
}

/**
 * Per-branch custom domain (e.g. "grace.example.com").
 *
 * Lifecycle:
 *   pending  → admin submits request
 *   active   → super admin approves
 *   inactive → super admin deactivates a previously active domain
 *   rejected → super admin rejects a pending request
 *
 * The branding fields (logo, display_name, tagline, etc.) are surfaced on the
 * sign-in / sign-up pages when a visitor accesses the platform via that domain.
 */
@Entity("branch_custom_domains")
export class CustomDomain {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** The hostname users will visit, lower-cased and without protocol/path. */
  @Index({ unique: true })
  @Column()
  domain: string;

  // ─── Relations ──────────────────────────────────────────────────────────
  @Column()
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: "CASCADE" })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @Column()
  denomination_id: string;

  @ManyToOne(() => Denomination, { onDelete: "CASCADE" })
  @JoinColumn({ name: "denomination_id" })
  denomination: Denomination;

  // ─── Branding shown on login / sign-up ─────────────────────────────────
  /** Public-facing display name (defaults to branch name). */
  @Column()
  display_name: string;

  @Column({ nullable: true })
  logo_url: string;

  /** Cached at request time but kept editable — falls back to branch.name. */
  @Column()
  church_name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  pastor_name: string;

  @Column({ nullable: true })
  contact_email: string;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({ type: "text", nullable: true })
  tagline: string;

  /** Brand accent color (hex, e.g. "#6366F1"). */
  @Column({ nullable: true })
  primary_color: string;

  /**
   * If true, visitors who sign up through this domain are auto-routed into
   * the branch's join-request flow. If false, signups are blocked.
   */
  @Column({ default: true })
  allow_self_signup: boolean;

  // ─── Workflow ───────────────────────────────────────────────────────────
  @Column({
    type: "enum",
    enum: CustomDomainStatus,
    default: CustomDomainStatus.PENDING,
  })
  status: CustomDomainStatus;

  @Column()
  requested_by: string;

  @Column({ nullable: true })
  reviewed_by: string;

  @Column({ type: "timestamp", nullable: true })
  reviewed_at: Date;

  @Column({ type: "text", nullable: true })
  rejection_reason: string;

  /**
   * Optional structured config for the public branded landing page rendered at
   * the root of the custom domain. Stored as JSONB so the schema can grow
   * without migrations. See LandingConfig for the supported keys.
   */
  @Column({ type: "jsonb", nullable: true })
  landing_config: LandingConfig | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

/* ─── Landing-page config shape ─────────────────────────────────────────── */

export interface LandingServiceTime {
  /** "Sunday Service", "Wednesday Bible Study"… */
  label: string;
  /** Human-friendly day. Optional — e.g. "Sundays". */
  day?: string;
  /** Human-friendly time. Optional — e.g. "9:00 AM". */
  time?: string;
  /** Optional background image for this service card (URL). */
  background_image?: string;
}

export interface LandingMinistry {
  title: string;
  description?: string;
  /** Free-form lucide icon name; renderer falls back to a default icon. */
  icon?: string;
  /** Optional background image URL for this ministry card. */
  background_image?: string;
}

/**
 * A "highlight" is a curated photo collection — e.g. a service, event,
 * outreach or activity that took place on a given date.  The public landing
 * & about pages render them as a filterable gallery (by title or date).
 */
export interface LandingHighlight {
  /** Stable client-generated id used for keys. Optional. */
  id?: string;
  title: string;
  /** ISO date string (YYYY-MM-DD). Optional. */
  date?: string;
  description?: string;
  /** One or more photo URLs. */
  images: string[];
}

/**
 * Core-value card — what the church believes / stands for.  Either an icon
 * (lucide-react name) or an uploaded image may be provided; the renderer
 * prefers the image when both are set.
 */
export interface LandingCoreValue {
  title: string;
  description?: string;
  icon?: string;
  image?: string;
}

export interface LandingSocialLinks {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  twitter?: string;
  whatsapp?: string;
  website?: string;
}

export interface LandingConfig {
  /** Big background image for the hero section. */
  hero_image_url?: string;
  /** Bold one-liner under the church name. */
  hero_headline?: string;
  /** Supporting paragraph under the headline. */
  hero_subheadline?: string;
  /** Label of the primary call-to-action button (defaults to "Sign Up"). */
  cta_primary_label?: string;
  /** "About us" rich text — one or two paragraphs. */
  about?: string;
  /** Service / event recurrence list. */
  service_times?: LandingServiceTime[];
  /** Up to ~6 ministry / focus-area cards. */
  ministries?: LandingMinistry[];
  /**
   * Legacy flat photo list. Kept for backward compatibility — new content
   * should be authored as `highlights[]`.  At render time the legacy list is
   * surfaced as a single "Gallery" highlight when `highlights` is empty.
   */
  gallery_urls?: string[];
  /** Curated photo collections grouped by title / date. */
  highlights?: LandingHighlight[];
  /** Core values shown on the landing & about pages. */
  core_values?: LandingCoreValue[];
  /** Embedded YouTube/Vimeo URL for the welcome video. */
  video_url?: string;
  /** Mission statement. */
  mission?: string;
  /** Social media handles. */
  social?: LandingSocialLinks;
  /** Show the "Join us this Sunday" join-request CTA on the landing page. */
  show_join_cta?: boolean;
}
