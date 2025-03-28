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
    
    // Kullanıcının tamamlanmış siparişlerinin toplam tutarını hesapla
    const result = await prisma.order.aggregate({
      where: {
        userId: session.user.id,
        status: {
          in: ['completed', 'COMPLETED'] // Büyük/küçük harf farklılıklarını kapsayalım
        }
      },
      _sum: {
        totalPrice: true
      }
    });
    
    // Toplam harcamayı döndür (null ise 0 kabul et)
    const totalSpent = result._sum.totalPrice || 0;
    
    // Başarılı yanıt döndür
    return NextResponse.json({ totalSpent });
  } catch (error) {
    console.error('Toplam harcama hesaplanırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 