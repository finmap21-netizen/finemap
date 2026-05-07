import { Router } from "express";
import { db, taxRulesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ListRulesQueryParams, UpdateRuleBody } from "@workspace/api-zod";

const router = Router();

router.get("/rules", requireAuth, async (req, res): Promise<void> => {
  const params = ListRulesQueryParams.safeParse(req.query);
  let rules = await db.select().from(taxRulesTable).where(eq(taxRulesTable.isActive, true));

  if (params.success) {
    if (params.data.regime) rules = rules.filter(r => r.regime === params.data.regime);
    if (params.data.declarationType) rules = rules.filter(r => r.declarationType === params.data.declarationType);
  }

  res.json(rules.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

router.get("/rules/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [rule] = await db.select().from(taxRulesTable).where(eq(taxRulesTable.id, id));
  if (!rule) {
    res.status(404).json({ error: "لم يتم العثور على القانون" });
    return;
  }
  res.json({ ...rule, createdAt: rule.createdAt.toISOString(), updatedAt: rule.updatedAt.toISOString() });
});

router.patch("/rules/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = UpdateRuleBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [rule] = await db.update(taxRulesTable).set(parsed.data).where(eq(taxRulesTable.id, id)).returning();
  if (!rule) {
    res.status(404).json({ error: "لم يتم العثور على القانون" });
    return;
  }
  res.json({ ...rule, createdAt: rule.createdAt.toISOString(), updatedAt: rule.updatedAt.toISOString() });
});

export default router;
