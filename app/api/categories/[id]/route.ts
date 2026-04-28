import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const cat = await prisma.category.update({
    where: { id: parseInt(params.id) },
    data: { ...data, updatedAt: new Date() },
  });
  return NextResponse.json(cat);
}
