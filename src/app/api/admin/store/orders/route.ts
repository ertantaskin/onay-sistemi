import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Tüm siparişleri getir
export async function GET(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // URL'den status parametresini al
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    // Filtreleme koşullarını oluştur
    const where = status ? { status: status } : {};

    // Siparişleri getir
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        paymentMethod: true
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Siparişler getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Siparişler getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Yeni sipariş oluştur
export async function POST(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { items, totalPrice } = body;

    // Gerekli alanların kontrolü
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sipariş öğeleri gereklidir." },
        { status: 400 }
      );
    }

    if (typeof totalPrice !== "number" || totalPrice <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir toplam tutar gereklidir." },
        { status: 400 }
      );
    }

    // Sipariş oluştur
    const order = await prisma.order.create({
      data: {
        userId: body.userId,
        status: body.status || "pending",
        totalPrice,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Sipariş oluşturulurken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
} 