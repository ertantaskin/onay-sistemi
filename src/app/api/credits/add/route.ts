import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { amount } = await req.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Geçerli bir kredi miktarı girin.' },
        { status: 400 }
      );
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (prisma) => {
      // Kredi işlemi kaydı oluştur
      const transaction = await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'deposit',
          amount: amount,
        }
      });

      // Kullanıcının kredisini artır
      const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { credit: { increment: amount } }
      });

      return { transaction, user };
    });

    return NextResponse.json({
      message: 'Kredi başarıyla yüklendi.',
      transaction: {
        id: result.transaction.id,
        amount: result.transaction.amount,
        type: result.transaction.type,
        createdAt: result.transaction.createdAt
      },
      user: {
        credit: result.user.credit
      }
    });
  } catch (error) {
    console.error('Kredi yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Kredi yüklenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 