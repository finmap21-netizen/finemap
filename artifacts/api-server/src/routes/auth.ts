import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, requireAuth, AuthenticatedRequest } from "../lib/auth";
import { RegisterBody, LoginBody } from "@workspace/api-zod";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password } = parsed.data;
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    return;
  }
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hashPassword(password),
    role: "user",
    isActive: true,
  }).returning();
  const token = generateToken(user.id, user.role);
  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ error: "الحساب غير نشط" });
    return;
  }
  const token = generateToken(user.id, user.role);
  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() },
    token,
  });
});

router.post("/auth/logout", async (_req, res): Promise<void> => {
  res.json({ message: "تم تسجيل الخروج بنجاح" });
});

router.get("/auth/me", requireAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, createdAt: user.createdAt.toISOString() });
});

export default router;
