import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Toplam kayıt sayısını al
    const total = await prisma.coupon.count();

    // Kuponları getir
    const coupons = await prisma.coupon.findMany({
      include: {
        usedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    return NextResponse.json({
      coupons,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Kupon listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kupon listesi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { code, amount, maxUses } = await req.json();

    if (!code || !amount) {
      return NextResponse.json(
        { error: 'Kupon kodu ve miktar gereklidir.' },
        { status: 400 }
      );
    }

    // Kupon kodunun benzersiz olduğunu kontrol et
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code }
    });

    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Bu kupon kodu zaten kullanımda.' },
        { status: 400 }
      );
    }

    // Yeni kupon oluştur
    const coupon = await prisma.coupon.create({
      data: {
        code,
        amount,
        maxUses: maxUses || null,
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Kupon başarıyla oluşturuldu.',
      coupon
    });
  } catch (error) {
    console.error('Kupon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kupon oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Kupon ID\'si gereklidir.' },
        { status: 400 }
      );
    }

    // Kuponu sil
    await prisma.coupon.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Kupon başarıyla silindi.'
    });
  } catch (error) {
    console.error('Kupon silme hatası:', error);
    return NextResponse.json(
      { error: 'Kupon silinirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 