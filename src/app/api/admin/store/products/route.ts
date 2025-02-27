import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tüm ürünleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const products = await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
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

// Yeni ürün ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const { name, description, price, stock, imageUrl, categoryId, isActive } = await request.json();

    if (!name || !description || price === undefined || stock === undefined || !categoryId) {
      return NextResponse.json(
        { error: "Eksik veya geçersiz bilgiler" },
        { status: 400 }
      );
    }

    // Kategori var mı kontrol et
    const category = await prisma.productCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Geçersiz kategori" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        imageUrl: imageUrl || null,
        categoryId,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Ürün eklenirken hata:", error);
    return NextResponse.json(
      { error: "Ürün eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 