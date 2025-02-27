import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Belirli bir siparişin detaylarını getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si gereklidir." },
        { status: 400 }
      );
    }

    // Siparişi getir
    const order = await prisma.order.findUnique({
      where: { id: orderId },
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
        paymentMethod: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Sipariş detayları getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş detayları getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Sipariş durumunu güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const orderId = resolvedParams.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si gereklidir." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status } = body;

    // Durum kontrolü
    if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
      return NextResponse.json(
        { error: "Geçerli bir sipariş durumu gereklidir." },
        { status: 400 }
      );
    }

    // Siparişin varlığını kontrol et
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    // Sipariş durumunu güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        paymentMethod: true,
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Sipariş güncellenirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Siparişi sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz bulunmamaktadır." },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Siparişin varlığını kontrol et
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Sipariş bulunamadı." },
        { status: 404 }
      );
    }

    // Siparişi sil (önce sipariş öğelerini sil)
    await prisma.$transaction(async (tx) => {
      // Sipariş öğelerini sil
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Siparişi sil
      await tx.order.delete({
        where: { id: orderId },
      });
    });

    return NextResponse.json(
      { message: "Sipariş başarıyla silindi." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sipariş silinirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 