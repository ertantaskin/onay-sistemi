import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    const category = await prisma.productCategory.findUnique({
      where: {
        id: categoryId,
        isActive: true,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Kategori alınırken hata:", error);
    return NextResponse.json(
      { error: "Kategori alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 