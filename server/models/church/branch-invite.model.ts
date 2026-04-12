import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Branch } from "./branch.model";
import { Denomination } from "./denomination.model";

@Entity("branch_invites")
export class BranchInvite {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** Short unique alphanumeric code shared with members */
  @Column({ unique: true })
  code: string;

  @Column()
  branch_id: string;

  @Column()
  denomination_id: string;

  @Column()
  created_by: string;

  /** Optional expiry (null = never expires) */
  @Column({ nullable: true, type: "timestamp" })
  expires_at: Date;

  /** Optional cap on total uses (null = unlimited) */
  @Column({ nullable: true, type: "integer" })
  max_uses: number;

  @Column({ default: 0 })
  uses_count: number;

  @Column({ default: true })
  is_active: boolean;

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
