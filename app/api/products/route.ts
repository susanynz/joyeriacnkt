import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const isAdmin = req.nextUrl.searchParams.get("admin") === "true";

  if (isAdmin) {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token || !verifyAdminToken(token))
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      stock: { gt: 0 },
      ...(category ? { category: { slug: category } } : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const product = await prisma.product.create({ data, include: { category: true } });
  return NextResponse.json(product, { status: 201 });
}
