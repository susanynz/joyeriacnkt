import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { wallet: string } }) {
  const orders = await prisma.order.findMany({
    where: { buyerWallet: params.wallet.toLowerCase() },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}
