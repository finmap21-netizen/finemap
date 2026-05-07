import { Router } from "express";
import { db, companiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../lib/auth";
import { UpdateCompanyBody } from "@workspace/api-zod";

const router = Router();

router.get("/company", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));
  if (!company) {
    res.status(404).json({ error: "لم يتم العثور على بيانات المؤسسة" });
    return;
  }
  res.json({
    ...company,
    annualRevenue: company.annualRevenue ?? null,
    employeeCount: company.employeeCount ?? null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  });
});

router.put("/company", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const parsed = UpdateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db.select().from(companiesTable).where(eq(companiesTable.userId, req.userId!));
  let company;
  if (existing.length > 0) {
    [company] = await db.update(companiesTable).set(parsed.data).where(eq(companiesTable.userId, req.userId!)).returning();
  } else {
    [company] = await db.insert(companiesTable).values({ ...parsed.data, userId: req.userId! }).returning();
  }
  res.json({
    ...company,
    annualRevenue: company.annualRevenue ?? null,
    employeeCount: company.employeeCount ?? null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  });
});

export default router;
