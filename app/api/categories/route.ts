import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, getTokenFromHeader } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const isAdmin = req.nextUrl.searchParams.get("admin") === "true";
  if (isAdmin) {
    const token = getTokenFromHeader(req.headers.get("authorization"));
    if (!token || !verifyAdminToken(token))
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    return NextResponse.json(await prisma.category.findMany({ orderBy: { name: "asc" } }));
  }
  return NextResponse.json(await prisma.category.findMany({ where: { isActive: true } }));
}

export async function POST(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get("authorization"));
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const data = await req.json();
  const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
  if (existing)
    return NextResponse.json({ error: `Slug '${data.slug}' ya existe` }, { status: 400 });

  const cat = await prisma.category.create({ data });
  return NextResponse.json(cat, { status: 201 });
}
