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
import { Denomination } from "./denomination.model";

/**
 * A Branch is a local church (physical location) that belongs to a Denomination.
 */
@Entity("branches")
export class Branch {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  country: string;

  /** Name / contact of the pastor leading this branch */
  @Column({ nullable: true })
  pastor_name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  is_headquarters: boolean;

  @Column()
  denomination_id: string;

  @ManyToOne(() => Denomination, (d) => d.branches, { onDelete: "CASCADE" })
  @JoinColumn({ name: "denomination_id" })
  denomination: Denomination;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
