import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "sme_tax_salt_2024").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function generateToken(userId: number, role: string): string {
  const payload = JSON.stringify({ userId, role, iat: Date.now() });
  const token = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", process.env.SESSION_SECRET || "fallback_secret_key").update(token).digest("hex");
  return `${token}.${sig}`;
}

export function verifyToken(token: string): { userId: number; role: string } | null {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = crypto.createHmac("sha256", process.env.SESSION_SECRET || "fallback_secret_key").update(payload).digest("hex");
    if (sig !== expected) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  userId?: number;
  userRole?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  req.userId = payload.userId;
  req.userRole = payload.role;
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireAuth(req, res, () => {
    if (req.userRole !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}
