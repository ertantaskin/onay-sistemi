import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Kategoriler alınırken hata:", error);
    return NextResponse.json(
      { error: "Kategoriler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 