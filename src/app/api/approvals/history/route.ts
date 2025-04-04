import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  console.log('Onay geçmişi isteği alındı');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Oturum bulunamadı');
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    console.log('Kullanıcı oturumu:', {
      userId: session.user.id,
      email: session.user.email
    });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('Sorgu parametreleri:', { page, limit, skip });

    console.log('Veritabanı bağlantısı başlatılıyor...');

    // Toplam kayıt sayısını al
    const total = await prisma.approval.count({
      where: { userId: session.user.id }
    });
    console.log('Toplam kayıt sayısı:', total);

    // Onay kayıtlarını getir
    const approvals = await prisma.approval.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    console.log('Bulunan kayıt sayısı:', approvals.length);
    console.log('İlk kayıt örneği:', approvals[0] || 'Kayıt bulunamadı');

    return NextResponse.json({
      approvals,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Onay geçmişi hatası:', error);
    return NextResponse.json(
      { error: 'Onay geçmişi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 