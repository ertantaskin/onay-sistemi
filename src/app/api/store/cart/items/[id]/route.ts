import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Sepet öğesini güncelle (miktar)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const itemId = resolvedParams.id;
    const body = await req.json();
    const { quantity } = body;

    // Miktar kontrolü
    if (!quantity || quantity < 1) {
      return NextResponse.json(
        { error: "Geçerli bir miktar gereklidir." },
        { status: 400 }
      );
    }

    // Sepet öğesinin varlığını ve kullanıcıya ait olup olmadığını kontrol et
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true,
        product: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Sepet öğesi bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının kendi sepetindeki öğeleri güncelleyebilmesi için kontrol
    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu sepet öğesini güncelleme yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Sepet durumunu kontrol et (sadece bekleyen siparişler güncellenebilir)
    if (orderItem.order.status !== "pending") {
      return NextResponse.json(
        { error: "Sadece bekleyen siparişlerdeki ürünler güncellenebilir." },
        { status: 400 }
      );
    }

    // Stok kontrolü
    if (quantity > orderItem.product.stock) {
      return NextResponse.json(
        { error: "Yeterli stok bulunmamaktadır." },
        { status: 400 }
      );
    }

    // Sepet öğesini güncelle
    const updatedItem = await prisma.orderItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    // Sipariş toplam fiyatını güncelle
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.orderId },
      include: { product: true },
    });

    const totalPrice = orderItems.reduce(
      (total: number, item: any) => total + item.price * item.quantity,
      0
    );

    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { totalPrice },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Sepet öğesi güncellenirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sepet öğesi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Sepet öğesini sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const itemId = resolvedParams.id;

    // Sepet öğesinin varlığını ve kullanıcıya ait olup olmadığını kontrol et
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Sepet öğesi bulunamadı." },
        { status: 404 }
      );
    }

    // Kullanıcının kendi sepetindeki öğeleri silebilmesi için kontrol
    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Bu sepet öğesini silme yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Sepet durumunu kontrol et (sadece bekleyen siparişler güncellenebilir)
    if (orderItem.order.status !== "pending") {
      return NextResponse.json(
        { error: "Sadece bekleyen siparişlerdeki ürünler silinebilir." },
        { status: 400 }
      );
    }

    // Sepet öğesini sil
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Kalan sepet öğelerini kontrol et
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    if (remainingItems.length === 0) {
      // Sepette öğe kalmadıysa siparişi sil
      await prisma.order.delete({
        where: { id: orderItem.orderId },
      });
    } else {
      // Sipariş toplam fiyatını güncelle
      const totalPrice = remainingItems.reduce(
        (total: number, item: any) => total + item.price * item.quantity,
        0
      );

      await prisma.order.update({
        where: { id: orderItem.orderId },
        data: { totalPrice },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sepet öğesi silinirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sepet öğesi silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 