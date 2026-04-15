/**
 * Standalone job: updateEventStatus
 *
 * Runs as a Render Cron Job in production (every minute).
 * Can also be run locally for testing:
 *   npx ts-node jobs/updateEventStatus.ts
 *   — or —
 *   npm run job:events
 */
import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import { AppDataSource } from "../config/database";
import { Event, EventStatus } from "../models/event";
import { Logger } from "../utils/logger";

const logger = new Logger({ level: "info" });

async function publishScheduledEvents(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ is_published: true })
    .where("status = :published", { published: EventStatus.PUBLISHED })
    .andWhere("is_published = false")
    .andWhere("publish_at IS NOT NULL")
    .andWhere("publish_at <= NOW()")
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Published: ${count}`);
}

async function markOngoingEvents(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ status: EventStatus.ONGOING })
    .where("status = :published", { published: EventStatus.PUBLISHED })
    .andWhere("is_published = true")
    .andWhere("(date::text || ' ' || time_from)::timestamp <= NOW()")
    .andWhere("(date::text || ' ' || time_to)::timestamp >= NOW()")
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Marked ongoing: ${count}`);
}

async function closeElapsedEvents(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ status: EventStatus.CLOSED, is_published: false })
    .where("status IN (:...statuses)", { statuses: [EventStatus.PUBLISHED, EventStatus.ONGOING] })
    .andWhere("(date::text || ' ' || time_to)::timestamp < NOW()")
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Closed: ${count}`);
}

async function run(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info("[updateEventStatus] DB connected");

    await publishScheduledEvents();
    await markOngoingEvents();
    await closeElapsedEvents();

    logger.info("[updateEventStatus] Done");
    process.exit(0);
  } catch (err) {
    logger.error("[updateEventStatus] Fatal error:", err);
    process.exit(1);
  }
}

run();
