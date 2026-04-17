import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

export enum DenominationRequestStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * A request from a potential denomination admin to have their
 * denomination registered on ChurchFlow.
 * The super-admin reviews and approves from the Developer Console.
 */
@Entity("denomination_requests")
export class DenominationRequest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  denomination_name: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: "text", nullable: true })
  reason: string;

  @Column({
    type: "enum",
    enum: DenominationRequestStatus,
    default: DenominationRequestStatus.PENDING,
  })
  status: DenominationRequestStatus;

  @Column({ nullable: true })
  reviewed_by: string;

  @Column({ type: "timestamp", nullable: true })
  reviewed_at: Date;

  @Column({ type: "text", nullable: true })
  rejection_reason: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
