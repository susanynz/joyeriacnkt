import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";
import { decryptAddress } from "@/lib/crypto";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const order = await prisma.order.findUnique({ where: { id: parseInt(params.id) } });
  if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

  return NextResponse.json({
    orderId: order.id,
    shippingAddress: decryptAddress(order.shippingAddressEncrypted),
  });
}
