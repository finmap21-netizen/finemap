import { Router } from "express";
import { db, invoiceRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin, AuthenticatedRequest } from "../lib/auth";
import { CreateInvoiceRequestBody, ProcessInvoiceRequestBody } from "@workspace/api-zod";

const router = Router();

router.get("/invoice-requests", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const items = await db.select().from(invoiceRequestsTable)
    .where(eq(invoiceRequestsTable.userId, req.userId!))
    .orderBy(desc(invoiceRequestsTable.createdAt));
  res.json(items.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

router.post("/invoice-requests", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const parsed = CreateInvoiceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(invoiceRequestsTable).values({
    ...parsed.data,
    userId: req.userId!,
    status: "pending",
  }).returning();
  res.status(201).json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

router.get("/admin/invoice-requests", requireAdmin, async (_req, res): Promise<void> => {
  const items = await db.select().from(invoiceRequestsTable).orderBy(desc(invoiceRequestsTable.createdAt));
  res.json(items.map(r => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })));
});

router.patch("/admin/invoice-requests/:id", requireAdmin, async (req: AuthenticatedRequest, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(rawId, 10);
  const parsed = ProcessInvoiceRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.update(invoiceRequestsTable)
    .set({ status: parsed.data.status, adminNotes: parsed.data.adminNotes })
    .where(eq(invoiceRequestsTable.id, id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "الطلب غير موجود" });
    return;
  }
  res.json({ ...item, createdAt: item.createdAt.toISOString(), updatedAt: item.updatedAt.toISOString() });
});

export default router;
