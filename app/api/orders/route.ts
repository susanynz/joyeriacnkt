import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyERC20Payment } from "@/lib/blockchain";
import { encryptAddress } from "@/lib/crypto";

export async function POST(req: NextRequest) {
  const { buyerWallet, txHash, paymentToken, amountToken, totalUsd, totalMxn, shipping, items } =
    await req.json();

  // Replay attack check
  const existing = await prisma.order.findUnique({ where: { txHash } });
  if (existing) return NextResponse.json({ error: "Transacción ya utilizada" }, { status: 400 });

  // Verificar stock
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product?.isActive)
      return NextResponse.json({ error: `Producto ${item.productId} no encontrado` }, { status: 404 });
    if (product.stock < item.quantity)
      return NextResponse.json({ error: `Stock insuficiente: ${product.name}` }, { status: 400 });
  }

  // Verificar pago on-chain
  const verification = await verifyERC20Payment(txHash, paymentToken, amountToken);
  if (!verification.valid)
    return NextResponse.json({ error: `Pago no verificado: ${verification.reason}` }, { status: 400 });

  // Obtener costo de envío de la tienda
  const store = await prisma.store.findFirst();
  const shippingCostMxn = shipping.country === "MX"
    ? (store?.shippingMxMxn ?? 180)
    : (store?.shippingUsUsd ?? 0) / 0.058;

  // Crear orden con dirección cifrada
  const order = await prisma.order.create({
    data: {
      buyerWallet: buyerWallet.toLowerCase(),
      txHash,
      paymentToken,
      amountToken,
      totalUsd,
      totalMxn,
      shippingCostMxn,
      status: "CONFIRMED",
      shippingAddressEncrypted: encryptAddress(shipping),
      shippingCountry: shipping.country,
      items: {
        create: items.map((i: any) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPriceUsd: i.unitPriceUsd,
          unitPriceMxn: i.unitPriceMxn,
          selectedColor: i.selectedColor,
          selectedSize: i.selectedSize,
        })),
      },
    },
    include: { items: true },
  });

  // Descontar stock
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity }, updatedAt: new Date() },
    });
  }

  return NextResponse.json(order, { status: 201 });
}
