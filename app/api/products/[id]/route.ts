import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findFirst({
    where: { id: parseInt(params.id), isActive: true },
    include: { category: true },
  });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { ...data, updatedAt: new Date() },
    include: { category: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { isActive: false, updatedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
