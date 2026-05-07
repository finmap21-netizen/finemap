import { Router } from "express";
import { db, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { generateCalendarEvents } from "../lib/calendar-engine";
import { ListCalendarEventsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/calendar/events", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const params = ListCalendarEventsQueryParams.safeParse(req.query);
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));

  if (!company) {
    res.json([]);
    return;
  }

  const year = params.success && params.data.year ? Number(params.data.year) : new Date().getFullYear();
  const events = generateCalendarEvents(company.taxRegime, year, company.hasCnas);

  if (params.success && params.data.month) {
    const month = Number(params.data.month);
    const filtered = events.filter(e => new Date(e.dueDate).getMonth() + 1 === month);
    res.json(filtered);
    return;
  }

  res.json(events);
});

router.get("/calendar/upcoming", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));

  if (!company) {
    res.json([]);
    return;
  }

  const year = new Date().getFullYear();
  const events = generateCalendarEvents(company.taxRegime, year, company.hasCnas);
  const upcoming = events.filter(e => e.daysUntilDue >= 0 && e.daysUntilDue <= 30);

  res.json(upcoming);
});

export default router;
