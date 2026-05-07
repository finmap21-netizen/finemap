import { Router } from "express";
import { db, penaltiesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { CalculatePenaltyBody } from "@workspace/api-zod";
import { calculatePenalty } from "../lib/penalty-engine";

const router = Router();

router.post("/penalties/calculate", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const parsed = CalculatePenaltyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { declarationType, regime, dueDate, paymentDate, taxAmount, hasPaymentRights } = parsed.data;
  const result = calculatePenalty({
    declarationType,
    regime,
    dueDate: new Date(dueDate),
    paymentDate: new Date(paymentDate),
    taxAmount,
    hasPaymentRights,
  });

  if (result.delayMonths > 0) {
    await db.insert(penaltiesTable).values({
      userId: req.userId!,
      declarationType,
      regime,
      dueDate,
      paymentDate,
      taxAmount,
      penaltyRate: result.penaltyRate,
      penaltyAmount: result.penaltyAmount,
      totalDue: result.totalDue,
    });
  }

  res.json(result);
});

router.get("/penalties", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const penalties = await db.select().from(penaltiesTable)
    .where(eq(penaltiesTable.userId, req.userId!))
    .orderBy(desc(penaltiesTable.createdAt));

  res.json(penalties.map(p => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  })));
});

export default router;
