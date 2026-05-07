import { Router } from "express";
import { db, usersTable, taxRulesTable, knowledgeTable, newsTable, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";
import { UpdateAdminUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/admin/users", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive, createdAt: u.createdAt.toISOString() })));
});

router.patch("/admin/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = UpdateAdminUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.update(usersTable).set(parsed.data).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "لم يتم العثور على المستخدم" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() });
});

router.delete("/admin/users/:id", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  if (id === req.userId) {
    res.status(400).json({ error: "لا يمكنك حذف حسابك الخاص" });
    return;
  }
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.sendStatus(204);
});

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const users = await db.select().from(usersTable);
  const rules = await db.select().from(taxRulesTable);
  const knowledge = await db.select().from(knowledgeTable);
  const news = await db.select().from(newsTable);
  const companies = await db.select().from(companiesTable);

  const activeUsers = users.filter(u => u.isActive).length;
  const regimeCounts: Record<string, number> = {};
  for (const c of companies) {
    regimeCounts[c.taxRegime] = (regimeCounts[c.taxRegime] ?? 0) + 1;
  }

  res.json({
    totalUsers: users.length,
    activeUsers,
    totalRules: rules.length,
    totalKnowledgeItems: knowledge.length,
    totalNewsItems: news.length,
    usersByRegime: Object.entries(regimeCounts).map(([regime, count]) => ({ regime, count })),
  });
});

export default router;
