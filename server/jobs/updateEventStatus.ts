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
import { scheduleRecurringEvents } from "../services/cron.service";

const logger = new Logger({ level: "info" });

// Event times are stored in local (church) time; compare against local NOW()
const TZ = process.env.APP_TIMEZONE || "Africa/Lagos";

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
    .andWhere("(date::text || ' ' || time_from)::timestamp <= (NOW() AT TIME ZONE :tz)", { tz: TZ })
    .andWhere("(date::text || ' ' || time_to)::timestamp >= (NOW() AT TIME ZONE :tz)", { tz: TZ })
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
    .andWhere("(date::text || ' ' || time_to)::timestamp < (NOW() AT TIME ZONE :tz)", { tz: TZ })
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Closed: ${count}`);
}

/**
 * Auto-open event attendance once the event start time has been reached.
 *
 * Targets only events that:
 *   • accept attendance,
 *   • have not been manually marked "closed" (we never override an admin override),
 *   • are inside the window: [start, end + 2h),
 *   • are not already in the desired state.
 */
async function openAttendanceAtStart(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ attendance_status: "open" })
    .where("accept_attendance = true")
    .andWhere("(date::text || ' ' || time_from)::timestamp <= (NOW() AT TIME ZONE :tz)", { tz: TZ })
    .andWhere(
      "(date::text || ' ' || time_to)::timestamp + interval '2 hours' > (NOW() AT TIME ZONE :tz)",
      { tz: TZ }
    )
    .andWhere("(attendance_status IS NULL OR attendance_status = 'scheduled')")
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Attendance opened: ${count}`);
}

/**
 * Auto-close event attendance once 2 hours have elapsed past the event end time.
 *
 * Only flips events whose attendance is not already "closed" so we don't
 * thrash the database on every cron tick.
 */
async function closeAttendanceAfterEnd(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ attendance_status: "closed" })
    .where("accept_attendance = true")
    .andWhere(
      "(date::text || ' ' || time_to)::timestamp + interval '2 hours' <= (NOW() AT TIME ZONE :tz)",
      { tz: TZ }
    )
    .andWhere("(attendance_status IS NULL OR attendance_status <> 'closed')")
    .execute();

  const count = result.affected ?? 0;
  logger.info(`[updateEventStatus] Attendance closed: ${count}`);
}

async function run(): Promise<void> {
  try {
    await AppDataSource.initialize();
    logger.info("[updateEventStatus] DB connected");

    await publishScheduledEvents();
    await markOngoingEvents();
    await closeElapsedEvents();
    await openAttendanceAtStart();
    await closeAttendanceAfterEnd();
    await scheduleRecurringEvents();
    logger.info("[updateEventStatus] Done");
    process.exit(0);
  } catch (err) {
    logger.error("[updateEventStatus] Fatal error:", err);
    process.exit(1);
  }
}

run();
