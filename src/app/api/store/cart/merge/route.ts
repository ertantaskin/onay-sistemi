import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";

// Misafir sepetini kullanıcı sepetine aktarma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const cookieStore = await cookies();
    const guestCartId = cookieStore.get('guestCartId')?.value;

    // Kullanıcı giriş yapmamışsa veya misafir sepeti yoksa işlem yapma
    if (!session || !session.user || !guestCartId) {
      return NextResponse.json(
        { error: "Kullanıcı oturumu veya misafir sepeti bulunamadı" },
        { status: 400 }
      );
    }

    // Misafir sepetini bul
    const guestCart = await prisma.guestCart.findUnique({
      where: {
        id: guestCartId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Misafir sepeti yoksa veya boşsa işlem yapma
    if (!guestCart || guestCart.items.length === 0) {
      return NextResponse.json(
        { message: "Aktarılacak misafir sepeti bulunamadı veya sepet boş" },
        { status: 200 }
      );
    }

    // Kullanıcının mevcut bir siparişi var mı kontrol et
    let userOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: true,
      },
    });

    // Kullanıcının siparişi yoksa yeni bir sipariş oluştur
    if (!userOrder) {
      userOrder = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          totalPrice: 0, // Toplam fiyat daha sonra hesaplanacak
        },
        include: {
          items: true,
        },
      });
    }

    // Misafir sepetindeki her ürün için
    for (const guestItem of guestCart.items) {
      // Ürünün stokta olup olmadığını kontrol et
      const product = await prisma.product.findUnique({
        where: {
          id: guestItem.productId,
          isActive: true,
        },
      });

      if (!product || product.stock < guestItem.quantity) {
        continue; // Stokta yoksa veya yeterli stok yoksa bu ürünü atla
      }

      // Ürün kullanıcının sepetinde var mı kontrol et
      const existingItem = userOrder.items.find(
        (item) => item.productId === guestItem.productId
      );

      if (existingItem) {
        // Ürün zaten sepette, miktarı güncelle
        const newQuantity = Math.min(existingItem.quantity + guestItem.quantity, product.stock);
        
        await prisma.orderItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: newQuantity,
          },
        });
      } else {
        // Ürün sepette değil, yeni bir öğe ekle
        await prisma.orderItem.create({
          data: {
            orderId: userOrder.id,
            productId: guestItem.productId,
            quantity: guestItem.quantity,
            price: guestItem.price,
          },
        });
      }
    }

    // Toplam fiyatı güncelle
    const updatedItems = await prisma.orderItem.findMany({
      where: {
        orderId: userOrder.id,
      },
      include: {
        product: true,
      },
    });

    const newTotalPrice = updatedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    await prisma.order.update({
      where: {
        id: userOrder.id,
      },
      data: {
        totalPrice: newTotalPrice,
      },
    });

    // Misafir sepetini sil
    await prisma.guestCart.delete({
      where: {
        id: guestCartId,
      },
    });

    // Misafir sepeti cookie'sini temizle
    const response = NextResponse.json({ success: true, message: "Sepet başarıyla aktarıldı" });
    response.cookies.delete('guestCartId');
    
    return response;
  } catch (error) {
    console.error("Sepet aktarılırken hata:", error);
    return NextResponse.json(
      { error: "Sepet aktarılırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 