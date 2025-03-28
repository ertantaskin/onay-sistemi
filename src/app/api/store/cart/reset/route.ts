import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    
    console.log("Sepet sıfırlama isteği alındı. Kullanıcı:", session.user.id);
    
    // Kullanıcının mevcut sepetini (PENDING durumundaki sipariş) bul
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "pending",
      },
      include: {
        items: true,
      },
    });
    
    // Mevcut sepet varsa sepet öğelerini ve sepeti sil
    if (existingOrder) {
      console.log("Mevcut sepet bulundu:", existingOrder.id);
      
      // Önce sepet öğelerini sil
      await prisma.orderItem.deleteMany({
        where: {
          orderId: existingOrder.id,
        },
      });
      
      // Ardından sepeti sil
      await prisma.order.delete({
        where: {
          id: existingOrder.id,
        },
      });
      
      console.log("Sepet ve içeriği başarıyla silindi");
    } else {
      console.log("Mevcut sepet bulunamadı, silme işlemi yapılmadı");
    }
    
    return NextResponse.json({
      success: true,
      message: "Sepet başarıyla sıfırlandı",
    });
  } catch (error) {
    console.error("Sepet sıfırlama hatası:", error);
    return NextResponse.json(
      { error: "Sepet sıfırlanırken bir hata oluştu" },
      { status: 500 }
    );
  }
} 