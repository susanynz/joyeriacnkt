import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSecret, createAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();
  if (!verifyAdminSecret(secret))
    return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
  return NextResponse.json({ token: createAdminToken() });
}
