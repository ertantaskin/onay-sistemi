import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Yetkisiz erişim' }),
        { status: 401 }
      );
    }
    
    // Kullanıcının son kredi işlemini getir
    const transaction = await prisma.creditTransaction.findFirst({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error('Son işlem alınırken hata:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { status: 500 }
    );
  }
} 