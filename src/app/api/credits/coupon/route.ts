import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Kupon kodları ve karşılık gelen kredi miktarları
const COUPON_CODES = {
  'WELCOME10': 10,
  'BONUS20': 20,
  'SPECIAL50': 50
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: 'Kupon kodu gereklidir.' },
        { status: 400 }
      );
    }

    // Kupon kodunu kontrol et
    const creditAmount = COUPON_CODES[code as keyof typeof COUPON_CODES];
    
    if (!creditAmount) {
      return NextResponse.json(
        { error: 'Geçersiz kupon kodu.' },
        { status: 400 }
      );
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (prisma) => {
      // Kredi işlemi kaydı oluştur
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'coupon',
          amount: creditAmount,
        }
      });

      // Kullanıcının kredisini artır
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: creditAmount } }
      });

      return { transaction, user };
    });

    return NextResponse.json({
      message: 'Kupon başarıyla kullanıldı.',
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        createdAt: result.transaction.createdAt
      },
      user: {
        credits: result.user.credits
      }
    });
  } catch (error) {
    console.error('Kupon kullanım hatası:', error);
    return NextResponse.json(
      { error: 'Kupon kullanılırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 