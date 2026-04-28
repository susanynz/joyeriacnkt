import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { status, trackingNumber, adminNotes } = await req.json();
  const order = await prisma.order.update({
    where: { id: parseInt(params.id) },
    data: {
      status,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(adminNotes ? { adminNotes } : {}),
      updatedAt: new Date(),
    },
  });
  return NextResponse.json(order);
}
