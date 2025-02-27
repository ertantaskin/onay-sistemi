import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const categories = await prisma.productCategory.findMany({
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

// Yeni kategori ekle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır" },
        { status: 403 }
      );
    }

    const { name, description, isActive } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Kategori adı zorunludur" },
        { status: 400 }
      );
    }

    const category = await prisma.productCategory.create({
      data: {
        name,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Kategori eklenirken hata:", error);
    return NextResponse.json(
      { error: "Kategori eklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 