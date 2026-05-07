import { Router } from "express";
import { db, companiesTable, remindersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { generateCalendarEvents } from "../lib/calendar-engine";

const router = Router();

function buildReminders(userId: number, company: { taxRegime: string; hasCnas: boolean }) {
  const year = new Date().getFullYear();
  const events = generateCalendarEvents(company.taxRegime, year, company.hasCnas);
  const reminders = [];
  let id = 1;

  for (const event of events) {
    const days = event.daysUntilDue;

    const getMsg = (type: string) => {
      const msgs: Record<string, { en: string; ar: string }> = {
        seven_days: {
          en: `7 days until ${event.declarationType} declaration`,
          ar: `لديك 7 أيام قبل آخر أجل لتصريح ${event.declarationType} — الموعد: ${event.dueDate}`,
        },
        three_days: {
          en: `3 days until ${event.declarationType}`,
          ar: `تنبيه — بقية 3 أيام فقط على تصريح ${event.declarationType}. التأخير = غرامة`,
        },
        one_day: {
          en: `Tomorrow is the deadline for ${event.declarationType}`,
          ar: `إنذار — غداً هو آخر أجل لتصريح ${event.declarationType}. لا تؤجل التصريح`,
        },
        due_day: {
          en: `Today is the deadline for ${event.declarationType}`,
          ar: `إنذار — اليوم هو آخر أجل لتصريح ${event.declarationType}. أي تأخير = غرامة مباشرة`,
        },
        overdue: {
          en: `OVERDUE: ${event.declarationType} declaration is late`,
          ar: `تأخير في تصريح ${event.declarationType} — الغرامة تتصاعد كل شهر. قم بالتسوية فوراً`,
        },
      };
      return msgs[type] ?? msgs.seven_days;
    };

    if (days === 7) {
      const m = getMsg("seven_days");
      reminders.push({ id: id++, userId, calendarEventId: event.id, reminderType: "seven_days", message: m.en, messageAr: m.ar, isAcknowledged: false, scheduledFor: new Date().toISOString(), event });
    } else if (days === 3) {
      const m = getMsg("three_days");
      reminders.push({ id: id++, userId, calendarEventId: event.id, reminderType: "three_days", message: m.en, messageAr: m.ar, isAcknowledged: false, scheduledFor: new Date().toISOString(), event });
    } else if (days === 1) {
      const m = getMsg("one_day");
      reminders.push({ id: id++, userId, calendarEventId: event.id, reminderType: "one_day", message: m.en, messageAr: m.ar, isAcknowledged: false, scheduledFor: new Date().toISOString(), event });
    } else if (days === 0) {
      const m = getMsg("due_day");
      reminders.push({ id: id++, userId, calendarEventId: event.id, reminderType: "due_day", message: m.en, messageAr: m.ar, isAcknowledged: false, scheduledFor: new Date().toISOString(), event });
    } else if (days < 0) {
      const m = getMsg("overdue");
      reminders.push({ id: id++, userId, calendarEventId: event.id, reminderType: "overdue", message: m.en, messageAr: m.ar, isAcknowledged: false, scheduledFor: new Date().toISOString(), event });
    }
  }

  return reminders;
}

router.get("/reminders", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));
  if (!company) {
    res.json([]);
    return;
  }
  const reminders = buildReminders(req.userId!, company);
  res.json(reminders);
});

router.patch("/reminders/:id/acknowledge", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));
  if (!company) {
    res.status(404).json({ error: "لم يتم العثور على البيانات" });
    return;
  }
  const reminders = buildReminders(req.userId!, company);
  const reminder = reminders.find(r => r.id === id);
  if (!reminder) {
    res.status(404).json({ error: "لم يتم العثور على التنبيه" });
    return;
  }
  res.json({ ...reminder, isAcknowledged: true });
});

export default router;
