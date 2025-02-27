import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resolvedParams = await params;
    const categoryId = resolvedParams.id;

    // Önce kategorinin var olup olmadığını kontrol et
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

    // Kategoriye ait ürünleri getir
    const products = await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Ürünler alınırken hata:", error);
    return NextResponse.json(
      { error: "Ürünler alınırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 