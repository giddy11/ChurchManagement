import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Branch } from "./branch.model";
import { Denomination } from "./denomination.model";

export type JoinRequestStatus = "pending" | "approved" | "rejected";

@Entity("branch_join_requests")
@Unique(["user_id", "branch_id"])
export class BranchJoinRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  user_id: string;

  @Column()
  branch_id: string;

  @Column()
  denomination_id: string;

  @Column({
    type: "enum",
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  })
  status: JoinRequestStatus;

  /** Optional note from the requesting user */
  @Column({ nullable: true })
  message: string;

  /** How they got here */
  @Column({
    type: "enum",
    enum: ["request", "invite_link"],
    default: "request",
  })
  joined_via: "request" | "invite_link";

  /** FK to BranchInvite when joined via invite */
  @Column({ nullable: true })
  invite_id: string;

  @Column({ nullable: true })
  reviewed_by: string;

  @Column({ nullable: true, type: "timestamp" })
  reviewed_at: Date;

  /** The requesting user (loaded lazily to avoid circular dep) */
  @ManyToOne("User", { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "user_id" })
  user: any;

  @ManyToOne(() => Branch, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "branch_id" })
  branch: Branch;

  @ManyToOne(() => Denomination, { onDelete: "CASCADE", eager: false })
  @JoinColumn({ name: "denomination_id" })
  denomination: Denomination;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
