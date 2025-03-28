import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies } from "next/headers";

// Misafir sepetini kullanıcı sepetine aktarma
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Kullanıcı giriş yapmamışsa işlemi reddet
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekiyor" },
        { status: 401 }
      );
    }
    
    const cookieStore = await cookies();
    const guestCartId = (await cookieStore.get('guestCartId'))?.value;
    
    // Misafir sepeti yoksa işlem yapma, sorun olmadan başarılı döndür
    if (!guestCartId) {
      return NextResponse.json({
        success: true,
        message: "Aktarılacak misafir sepeti bulunmadı",
        itemsTransferred: 0
      });
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
    
    // Misafir sepeti yoksa veya boşsa, işlem yapma
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Aktarılacak ürün bulunmadı",
        itemsTransferred: 0
      });
    }
    
    // Kullanıcının aktif siparişi var mı kontrol et
    let userOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    // Sipariş yoksa oluştur
    if (!userOrder) {
      userOrder = await prisma.order.create({
        data: {
          userId: session.user.id,
          status: "pending",
          totalPrice: 0,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }
    
    // Misafir sepetindeki ürünleri kullanıcı sepetine aktar
    let itemsTransferred = 0;
    
    for (const item of guestCart.items) {
      // Kullanıcı sepetinde aynı ürün var mı kontrol et
      const existingItem = userOrder.items.find(
        (i) => i.productId === item.productId
      );
      
      if (existingItem) {
        // Varsa miktarını artır
        await prisma.orderItem.update({
          where: {
            id: existingItem.id,
          },
          data: {
            quantity: existingItem.quantity + item.quantity,
            price: item.price,
          },
        });
      } else {
        // Yoksa yeni ekle
        await prisma.orderItem.create({
          data: {
            orderId: userOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }
      
      itemsTransferred++;
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
    
    const totalPrice = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    
    await prisma.order.update({
      where: {
        id: userOrder.id,
      },
      data: {
        totalPrice,
      },
    });
    
    // Misafir sepetini temizle
    await prisma.guestCartItem.deleteMany({
      where: {
        guestCartId: guestCart.id,
      },
    });
    
    // Misafir sepeti tablosundan silelim
    await prisma.guestCart.delete({
      where: {
        id: guestCart.id,
      },
    });
    
    // Misafir sepeti çerezini silelim
    cookieStore.delete('guestCartId');
    
    return NextResponse.json({
      success: true,
      message: `${itemsTransferred} ürün sepetinize aktarıldı`,
      itemsTransferred,
      cartId: userOrder.id
    });
    
  } catch (error) {
    console.error("Sepet birleştirme hatası:", error);
    return NextResponse.json(
      { error: "Sepet birleştirme sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
} 