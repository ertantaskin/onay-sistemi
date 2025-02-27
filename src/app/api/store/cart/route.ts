import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Kullanıcının sepetini getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir" },
        { status: 401 }
      );
    }

    // Kullanıcının bekleyen (pending) siparişini bul
    const pendingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    // Eğer bekleyen sipariş yoksa boş bir sepet döndür
    if (!pendingOrder) {
      return NextResponse.json({
        id: null,
        totalPrice: 0,
        items: [],
      });
    }

    return NextResponse.json(pendingOrder);
  } catch (error) {
    console.error("Sepet getirilirken hata:", error);
    return NextResponse.json(
      { error: "Sepet getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir" },
        { status: 401 }
      );
    }

    const { productId, quantity } = await request.json();

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Geçersiz ürün veya miktar" },
        { status: 400 }
      );
    }

    // Ürünün var olup olmadığını ve stokta olup olmadığını kontrol et
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Ürün bulunamadı" },
        { status: 404 }
      );
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: "Yeterli stok bulunmamaktadır" },
        { status: 400 }
      );
    }

    // Kullanıcının mevcut bir siparişi var mı kontrol et
    let order = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: true,
      },
    });

    // Eğer sipariş yoksa yeni bir sipariş oluştur
    if (!order) {
      order = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          totalPrice: product.price * quantity,
          items: {
            create: {
              productId: product.id,
              quantity: quantity,
              price: product.price,
            },
          },
        },
        include: {
          items: true,
        },
      });
    } else {
      // Sipariş varsa, ürün zaten sepette mi kontrol et
      const existingItem = order.items.find((item: any) => item.productId === productId);

      if (existingItem) {
        // Ürün zaten sepette, miktarı güncelle
        await prisma.orderItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: existingItem.quantity + quantity,
          },
        });
      } else {
        // Ürün sepette değil, yeni bir öğe ekle
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: quantity,
            price: product.price,
          },
        });
      }

      // Toplam fiyatı güncelle
      const updatedItems = await prisma.orderItem.findMany({
        where: {
          orderId: order.id,
        },
        include: {
          product: true,
        },
      });

      const newTotalPrice = updatedItems.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      );

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          totalPrice: newTotalPrice,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sepete eklerken hata:", error);
    return NextResponse.json(
      { error: "Sepete eklerken bir hata oluştu" },
      { status: 500 }
    );
  }
} 