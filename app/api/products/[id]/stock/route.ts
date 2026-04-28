import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { stock } = await req.json();
  if (stock < 0) return NextResponse.json({ error: "Stock no puede ser negativo" }, { status: 400 });

  const product = await prisma.product.update({
    where: { id: parseInt(params.id) },
    data: { stock, updatedAt: new Date() },
  });
  return NextResponse.json({ productId: product.id, stock: product.stock });
}
