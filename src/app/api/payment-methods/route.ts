import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from 'next-auth/jwt';

// GET /api/payment-methods
export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req: req });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sistemde tanımlı tüm aktif ödeme yöntemlerini getir
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Kredi ile ödeme yöntemini ekle
    const paymentMethodsWithCredit = [
      ...paymentMethods,
      {
        id: 'credit',
        name: 'Kredi ile Öde',
        description: 'Hesabınızdaki mevcut kredi bakiyeniz ile ödeme yapın',
        isActive: true,
        type: 'CREDIT',
        provider: 'INTERNAL'
      }
    ];

    return NextResponse.json(paymentMethodsWithCredit);
  } catch (error) {
    console.error("Ödeme yöntemleri getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Ödeme yöntemleri getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 