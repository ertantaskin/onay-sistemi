import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }
    
    // Kullanıcının sipariş sayısını getir
    const count = await prisma.order.count({
      where: {
        userId: session.user.id
      }
    });
    
    // Başarılı yanıt döndür
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Sipariş sayısı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 