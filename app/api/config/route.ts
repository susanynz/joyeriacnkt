import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function GET() {
  let store = await prisma.store.findFirst();
  if (!store) store = await prisma.store.create({ data: { name: "Nice Joyería" } });
  return NextResponse.json(store);
}

export async function PATCH(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  let store = await prisma.store.findFirst();
  if (!store) {
    store = await prisma.store.create({ data });
  } else {
    store = await prisma.store.update({ where: { id: store.id }, data });
  }
  return NextResponse.json(store);
}
