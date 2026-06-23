import { AppDataSource } from "../config/database";
import { FollowUpService } from "./follow-up.service";
import { Logger } from "../utils/logger";

const logger = new Logger({ level: "info" });

export async function processFollowUpAutomation(): Promise<void> {
  try {
    const svc = new FollowUpService();

    const escalated = await svc.escalateOverdue(3);
    if (escalated > 0) logger.info(`[FollowUpCron] Escalated ${escalated} overdue follow-up(s)`);

    const overdueNotifications = await svc.notifySevenDayOverdue();
    if (overdueNotifications > 0) logger.info(`[FollowUpCron] Sent ${overdueNotifications} overdue notification recipient(s)`);

    const highPriorityReminders = await svc.notifyHighPriorityDaily();
    if (highPriorityReminders > 0) logger.info(`[FollowUpCron] Sent ${highPriorityReminders} high-priority reminder recipient(s)`);

    const branchRows: { id: string }[] = await AppDataSource.query(`SELECT id FROM branches`);
    let absentTotal = 0;
    let birthdaysTotal = 0;

    for (const b of branchRows) {
      try {
        absentTotal += await svc.detectAbsenteesForBranch(b.id, 1);
        birthdaysTotal += await svc.detectBirthdaysForBranch(b.id);
      } catch (err) {
        logger.error(`[FollowUpCron] Automation failed for branch ${b.id}:`, err);
      }
    }

    if (absentTotal > 0) logger.info(`[FollowUpCron] Created ${absentTotal} absent-member follow-up(s)`);
    if (birthdaysTotal > 0) logger.info(`[FollowUpCron] Created ${birthdaysTotal} birthday follow-up(s)`);
  } catch (err) {
    logger.error("[FollowUpCron] Automation error:", err);
  }
}
