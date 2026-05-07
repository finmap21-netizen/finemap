import { Router } from "express";
import { db, newsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, AuthenticatedRequest } from "../lib/auth";
import { CreateNewsBody } from "@workspace/api-zod";

const router = Router();

router.get("/news", requireAuth, async (_req, res): Promise<void> => {
  const items = await db.select().from(newsTable).orderBy(desc(newsTable.publishedAt));
  res.json(items.map(n => ({ ...n, publishedAt: n.publishedAt.toISOString(), createdAt: n.createdAt.toISOString() })));
});

router.post("/news", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(newsTable).values({
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
  }).returning();
  res.status(201).json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString() });
});

router.patch("/news/:id", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = CreateNewsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(newsTable).set({
    ...parsed.data,
    publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date(),
  }).where(eq(newsTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "لم يتم العثور على الخبر" });
    return;
  }
  res.json({ ...item, publishedAt: item.publishedAt.toISOString(), createdAt: item.createdAt.toISOString() });
});

router.delete("/news/:id", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  await db.delete(newsTable).where(eq(newsTable.id, id));
  res.sendStatus(204);
});

export default router;
