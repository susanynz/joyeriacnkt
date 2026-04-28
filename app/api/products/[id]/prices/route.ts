import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCheckoutPrices } from "@/lib/prices";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const product = await prisma.product.findFirst({
    where: { id: parseInt(params.id), isActive: true },
  });
  if (!product) return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  const prices = await getCheckoutPrices(product.priceUsd);
  return NextResponse.json({ productId: product.id, ...prices });
}
