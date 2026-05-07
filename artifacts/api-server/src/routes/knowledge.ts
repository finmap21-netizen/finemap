import { Router } from "express";
import { db, knowledgeTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { ListKnowledgeItemsQueryParams } from "@workspace/api-zod";

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

export default router;
