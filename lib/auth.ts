import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cambia_esto";
const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || "";

export function verifyAdminSecret(secret: string): boolean {
  if (!ADMIN_SECRET) throw new Error("ADMIN_SECRET_KEY no configurada");
  return secret === ADMIN_SECRET;
}

export function createAdminToken(): string {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}
