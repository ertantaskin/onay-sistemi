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
    
    // Kullanıcının son 3 siparişini getir
    const recentOrders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    // Daha kolay kullanılabilir bir formata dönüştür
    const formattedOrders = recentOrders.map(order => {
      // İlk ürünün adını al (birden fazla ürün varsa)
      const firstProduct = order.items && order.items[0] && order.items[0].product;
      const productName = firstProduct ? firstProduct.name : 'Bilinmeyen Ürün';
      
      // Toplam tutar için siparişin toplam fiyatını kullan
      const amount = order.totalPrice || 0;
      
      return {
        id: order.id,
        productName: productName,
        date: order.createdAt.toISOString(),
        status: order.status.toLowerCase(),
        amount: amount
      };
    });
    
    // Başarılı yanıt döndür
    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error('Son siparişler alınırken hata:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
} 