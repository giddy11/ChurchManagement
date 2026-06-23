import cron from "node-cron";
import { Logger } from "../utils/logger";
import {
  publishScheduledEvents,
  markOngoingEvents,
  closeElapsedEvents,
  openAttendanceAtStart,
  closeAttendanceAfterEnd,
  scheduleRecurringEvents,
} from "./event/event.cron";
import { processFollowUpAutomation } from "./follow-up.cron";

const logger = new Logger({ level: "info" });

/** All event-status jobs in sequence — called by Cloud Scheduler every minute. */
export async function runEventJobs(): Promise<void> {
  await publishScheduledEvents();
  await markOngoingEvents();
  await closeElapsedEvents();
  await openAttendanceAtStart();
  await closeAttendanceAfterEnd();
  await scheduleRecurringEvents();
}

export { processFollowUpAutomation };
export { scheduleRecurringEvents } from "./event/event.cron";

/** In-process scheduler — only used locally when IN_TEST=true. */
export function startCronJobs(): void {
  cron.schedule("* * * * *", async () => {
    try {
      await runEventJobs();
    } catch (err) {
      logger.error("[CronService] Error during event jobs:", err);
    }
  });

  cron.schedule("0 * * * *", async () => {
    try {
      await processFollowUpAutomation();
    } catch (err) {
      logger.error("[CronService] Error during follow-up jobs:", err);
    }
  });

  logger.info("[CronService] Scheduled jobs started (events: every min, follow-ups: hourly)");
}
