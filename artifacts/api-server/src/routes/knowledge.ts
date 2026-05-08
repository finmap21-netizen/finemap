import { Router } from "express";
import { db, knowledgeTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "../lib/auth";
import { ListKnowledgeItemsQueryParams, CreateKnowledgeItemBody, UpdateKnowledgeItemBody } from "@workspace/api-zod";

const router = Router();

router.get("/knowledge", requireAuth, async (req, res): Promise<void> => {
  const params = ListKnowledgeItemsQueryParams.safeParse(req.query);
  let items = await db.select().from(knowledgeTable).orderBy(knowledgeTable.id);

  if (params.success) {
    const { category, regime, q } = params.data;
    if (category) items = items.filter(i => i.category === category);
    if (regime) items = items.filter(i => i.regime === regime || i.regime === null);
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter(i =>
        i.questionAr.toLowerCase().includes(lower) ||
        i.answerAr.toLowerCase().includes(lower) ||
        i.question.toLowerCase().includes(lower)
      );
    }
  }

  res.json(items.map(i => ({ ...i, createdAt: i.createdAt.toISOString() })));
});

router.get("/knowledge/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const [item] = await db.select().from(knowledgeTable).where(eq(knowledgeTable.id, id));
  if (!item) {
    res.status(404).json({ error: "لم يتم العثور على العنصر" });
    return;
  }
  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.post("/knowledge", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateKnowledgeItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(knowledgeTable).values(parsed.data).returning();
  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.patch("/knowledge/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  const parsed = UpdateKnowledgeItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.update(knowledgeTable).set(parsed.data).where(eq(knowledgeTable.id, id)).returning();
  if (!item) { res.status(404).json({ error: "العنصر غير موجود" }); return; }
  res.json({ ...item, createdAt: item.createdAt.toISOString() });
});

router.delete("/knowledge/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  await db.delete(knowledgeTable).where(eq(knowledgeTable.id, id));
  res.sendStatus(204);
});

export default router;
