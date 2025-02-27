import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Belirli bir siparişi getir
export async function GET(
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
    const orderId = resolvedParams.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si gereklidir." },
        { status: 400 }
      );
    }

    // Siparişi getir
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
      },
      include: {
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
    console.error("Sipariş getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

// Siparişi iptal et
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
    const orderId = resolvedParams.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Sipariş ID'si gereklidir." },
        { status: 400 }
      );
    }

    // Siparişi kontrol et
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: session.user.id,
        status: "pending", // Sadece bekleyen siparişler iptal edilebilir
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "İptal edilebilir sipariş bulunamadı." },
        { status: 404 }
      );
    }

    // Siparişi iptal et
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "cancelled",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Sipariş iptal edilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sipariş iptal edilirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 