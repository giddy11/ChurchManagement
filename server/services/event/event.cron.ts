import { AppDataSource } from "../../config/database";
import { Event, EventStatus, RecurrencePattern, MonthlyRecurrenceType } from "../../models/event";
import { Logger } from "../../utils/logger";

const logger = new Logger({ level: "info" });
const TZ = process.env.APP_TIMEZONE || "Africa/Lagos";

// ── Event status jobs ─────────────────────────────────────────────────────────

export async function publishScheduledEvents(): Promise<void> {
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

  if (result.affected && result.affected > 0) {
    logger.info(`[EventCron] Published ${result.affected} scheduled event(s)`);
  }
}

export async function markOngoingEvents(): Promise<void> {
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

  if (result.affected && result.affected > 0) {
    logger.info(`[EventCron] Marked ${result.affected} event(s) as ongoing`);
  }
}

export async function closeElapsedEvents(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);
  const result = await repo
    .createQueryBuilder()
    .update(Event)
    .set({ status: EventStatus.CLOSED, is_published: false })
    .where("status IN (:...statuses)", { statuses: [EventStatus.PUBLISHED, EventStatus.ONGOING] })
    .andWhere("(date::text || ' ' || time_to)::timestamp < (NOW() AT TIME ZONE :tz)", { tz: TZ })
    .execute();

  if (result.affected && result.affected > 0) {
    logger.info(`[EventCron] Closed ${result.affected} elapsed event(s)`);
  }
}

export async function openAttendanceAtStart(): Promise<void> {
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

  if (result.affected && result.affected > 0) {
    logger.info(`[EventCron] Opened attendance for ${result.affected} event(s)`);
  }
}

export async function closeAttendanceAfterEnd(): Promise<void> {
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

  if (result.affected && result.affected > 0) {
    logger.info(`[EventCron] Closed attendance for ${result.affected} event(s)`);
  }
}

// ── Recurring event helpers ───────────────────────────────────────────────────

function nextWeeklyDate(fromDate: Date, days: number[], weekMultiplier: number): Date {
  const sorted = [...days].sort((a, b) => a - b);
  const dow = fromDate.getDay();
  const later = sorted.find((d) => d > dow);
  if (later !== undefined) {
    const next = new Date(fromDate);
    next.setDate(next.getDate() + (later - dow));
    return next;
  }
  const next = new Date(fromDate);
  next.setDate(next.getDate() + (7 * weekMultiplier - dow + sorted[0]));
  return next;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number): Date | null {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const date = new Date(year, month, 1 + offset + (nth - 1) * 7);
  return date.getMonth() === month ? date : null;
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  last.setDate(last.getDate() - offset);
  return last;
}

const ORDINAL_MAP: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };
const DAY_MAP: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function getNextOccurrenceDate(event: Event): Date | null {
  const current = new Date(event.date + "T00:00:00");

  switch (event.recurrence_pattern) {
    case RecurrencePattern.DAILY: {
      const next = new Date(current);
      next.setDate(next.getDate() + 1);
      return next;
    }
    case RecurrencePattern.WEEKLY: {
      if (event.recurrence_days?.length) return nextWeeklyDate(current, event.recurrence_days, 1);
      const next = new Date(current);
      next.setDate(next.getDate() + 7);
      return next;
    }
    case RecurrencePattern.EVERY_2_WEEKS: {
      if (event.recurrence_days?.length) return nextWeeklyDate(current, event.recurrence_days, 2);
      const next = new Date(current);
      next.setDate(next.getDate() + 14);
      return next;
    }
    case RecurrencePattern.MONTHLY: {
      const y = current.getFullYear();
      const m = current.getMonth() + 1;
      if (event.monthly_type === MonthlyRecurrenceType.DAY_OF_MONTH && event.monthly_day) {
        const lastDay = new Date(y, m + 1, 0).getDate();
        return new Date(y, m, Math.min(event.monthly_day, lastDay));
      }
      if (event.monthly_type === MonthlyRecurrenceType.DAY_OF_WEEK && event.monthly_week_descriptor) {
        const parts = event.monthly_week_descriptor.toLowerCase().split("_");
        const weekday = DAY_MAP[parts[parts.length - 1]];
        if (weekday === undefined) return null;
        if (parts[0] === "last") return lastWeekdayOfMonth(y, m, weekday);
        const nth = ORDINAL_MAP[parts[0]];
        if (!nth) return null;
        return nthWeekdayOfMonth(y, m, weekday, nth);
      }
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    case RecurrencePattern.QUARTERLY: {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 3);
      return next;
    }
    case RecurrencePattern.YEARLY: {
      const next = new Date(current);
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }
    default:
      return null;
  }
}

export async function scheduleRecurringEvents(): Promise<void> {
  const repo = AppDataSource.getRepository(Event);

  const events = await repo.find({
    where: { is_recurring: true, status: EventStatus.CLOSED },
    select: ["id", "date", "recurrence_pattern", "recurrence_days",
             "monthly_type", "monthly_day", "monthly_week_descriptor",
             "recurrence_end_date"],
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const updates: Array<{ id: string; date: string }> = [];

  for (const event of events) {
    if (!event.recurrence_pattern) continue;
    if (event.recurrence_end_date && new Date(event.recurrence_end_date) < today) continue;

    let nextDate = getNextOccurrenceDate(event);
    let iterations = 0;
    while (nextDate && nextDate < today && iterations < 365) {
      const stub = {
        date: nextDate.toISOString().split("T")[0],
        recurrence_pattern: event.recurrence_pattern,
        recurrence_days: event.recurrence_days,
        monthly_type: event.monthly_type,
        monthly_day: event.monthly_day,
        monthly_week_descriptor: event.monthly_week_descriptor,
      } as Event;
      nextDate = getNextOccurrenceDate(stub);
      iterations++;
    }

    if (!nextDate) continue;
    if (event.recurrence_end_date && nextDate > new Date(event.recurrence_end_date)) continue;

    updates.push({ id: event.id, date: nextDate.toISOString().split("T")[0] });
  }

  if (updates.length === 0) return;

  await AppDataSource.createQueryBuilder()
    .update(Event)
    .set({
      status: EventStatus.PUBLISHED,
      is_published: true,
      publish_at: null,
      date: () =>
        `(CASE id ${updates.map((u) => `WHEN '${u.id}' THEN '${u.date}'`).join(" ")} END)::date`,
    })
    .whereInIds(updates.map((u) => u.id))
    .execute();

  logger.info(`[EventCron] Rescheduled ${updates.length} recurring event(s)`);
}
