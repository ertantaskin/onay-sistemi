import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcının siparişlerini getir
export async function GET(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    // URL'den status parametresini al
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    // Filtreleme koşullarını oluştur
    const where = {
      userId: session.user.id,
      ...(status ? { status: status } : {}),
    };

    // Siparişleri getir
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        paymentMethod: true,
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
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { items, totalAmount } = body;

    // Gerekli alanların kontrolü
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Sipariş öğeleri gereklidir." },
        { status: 400 }
      );
    }

    if (typeof totalAmount !== "number" || totalAmount <= 0) {
      return NextResponse.json(
        { error: "Geçerli bir toplam tutar gereklidir." },
        { status: 400 }
      );
    }

    // Kullanıcının yeterli kredisi var mı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    if (user.credits < totalAmount) {
      return NextResponse.json(
        { error: "Yeterli krediniz bulunmamaktadır." },
        { status: 400 }
      );
    }

    // Ürünlerin varlığını ve stok durumunu kontrol et
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Ürün bulunamadı: ${item.productId}` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Ürün aktif değil: ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Sipariş oluştur
    const order = await prisma.$transaction(async (tx) => {
      // Kullanıcının kredisini düş
      await tx.user.update({
        where: { id: session.user.id },
        data: { credits: { decrement: totalAmount } },
      });

      // Siparişi oluştur
      const newOrder = await tx.order.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          totalAmount,
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: true,
        },
      });

      return newOrder;
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