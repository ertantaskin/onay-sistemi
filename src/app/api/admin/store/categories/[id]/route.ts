import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Kategori detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const categoryId = params.id;

    const category = await prisma.productCategory.findUnique({
      where: {
        id: categoryId,
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

// Kategori güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const categoryId = params.id;
    const { name, description, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur" },
        { status: 400 }
      );
    }

    // Önce kategorinin var olup olmadığını kontrol et
    const existingCategory = await prisma.productCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Kategoriyi güncelle
    const updatedCategory = await prisma.productCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Kategori güncellenirken hata:", error);
    return NextResponse.json(
      { error: "Kategori güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Kategori sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const categoryId = params.id;

    // Önce kategorinin var olup olmadığını kontrol et
    const existingCategory = await prisma.productCategory.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori bulunamadı" },
        { status: 404 }
      );
    }

    // Bu kategoriye ait ürünleri kontrol et
    const productsCount = await prisma.product.count({
      where: {
        categoryId: categoryId,
      },
    });

    if (productsCount > 0) {
      // Kategori altında ürünler varsa, kategoriye ait ürünleri pasif yap
      await prisma.product.updateMany({
        where: {
          categoryId: categoryId,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Kategoriyi sil
    await prisma.productCategory.delete({
      where: {
        id: categoryId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Kategori silinirken hata:", error);
    return NextResponse.json(
      { error: "Kategori silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 