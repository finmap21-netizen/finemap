import { Router } from "express";
import { db, companiesTable, newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { generateCalendarEvents } from "../lib/calendar-engine";

const router = Router();

router.get("/dashboard/summary", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));

  const recentNews = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt)).limit(3);

  if (!company) {
    res.json({
      upcomingDeadlines: 0,
      overdueCount: 0,
      nextDeadline: null,
      totalPenaltyRisk: 0,
      acknowledgedReminders: 0,
      pendingReminders: 0,
      regimeLabel: "غير محدد",
      recentNews: recentNews.map(n => ({
        ...n,
        publishedAt: n.publishedAt.toISOString(),
        createdAt: n.createdAt.toISOString(),
      })),
    });
    return;
  }

  const year = new Date().getFullYear();
  const events = generateCalendarEvents(company.taxRegime, year, company.hasCnas);

  const upcoming = events.filter(e => e.status === "upcoming");
  const overdue = events.filter(e => e.status === "overdue");
  const nextDeadline = upcoming.length > 0 ? upcoming[0] : null;

  const regimeLabels: Record<string, string> = {
    real: "النظام الحقيقي",
    simplified_real: "النظام الحقيقي المبسط",
    forfaitaire: "النظام الجزافي",
  };

  res.json({
    upcomingDeadlines: upcoming.length,
    overdueCount: overdue.length,
    nextDeadline,
    totalPenaltyRisk: overdue.length * 15000,
    acknowledgedReminders: 0,
    pendingReminders: overdue.length + events.filter(e => e.daysUntilDue <= 7 && e.daysUntilDue >= 0).length,
    regimeLabel: regimeLabels[company.taxRegime] ?? company.taxRegime,
    recentNews: recentNews.map(n => ({
      ...n,
      publishedAt: n.publishedAt.toISOString(),
      createdAt: n.createdAt.toISOString(),
    })),
  });
});

export default router;
