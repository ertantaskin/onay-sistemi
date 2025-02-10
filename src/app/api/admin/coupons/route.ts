import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Coupon from '@/models/Coupon';

// Admin yetkisi kontrolü için middleware
async function isAdmin(session: any) {
  if (!session || !session.user || session.user.role !== 'admin') {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');
    const skip = (page - 1) * limit;

    await dbConnect();

    // Arama kriterlerini oluştur
    const searchCriteria: any = {};
    if (search) {
      searchCriteria.code = { $regex: search, $options: 'i' };
    }
    if (isActive !== null) {
      searchCriteria.isActive = isActive === 'true';
    }

    // Toplam kayıt sayısını al
    const total = await Coupon.countDocuments(searchCriteria);

    // Kuponları getir
    const coupons = await Coupon.find(searchCriteria)
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      coupons: coupons.map(coupon => ({
        id: coupon._id,
        code: coupon.code,
        creditAmount: coupon.creditAmount,
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiresAt: coupon.expiresAt,
        createdBy: coupon.createdBy ? {
          id: coupon.createdBy._id,
          email: coupon.createdBy.email,
          name: coupon.createdBy.name,
        } : null,
        createdAt: coupon.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
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
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { code, creditAmount, usageLimit, expiresAt } = await req.json();

    if (!code || !creditAmount) {
      return NextResponse.json(
        { error: 'Kupon kodu ve kredi miktarı gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Kupon kodunun benzersiz olduğunu kontrol et
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'Bu kupon kodu zaten kullanımda.' },
        { status: 400 }
      );
    }

    // Yeni kupon oluştur
    const coupon = await Coupon.create({
      code,
      creditAmount,
      usageLimit,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: session.user.id,
      isActive: true,
      usedCount: 0,
    });

    return NextResponse.json({
      message: 'Kupon başarıyla oluşturuldu.',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        creditAmount: coupon.creditAmount,
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiresAt: coupon.expiresAt,
        createdAt: coupon.createdAt,
      },
    });
  } catch (error) {
    console.error('Kupon oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Kupon oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { couponId, isActive, usageLimit, expiresAt } = await req.json();

    if (!couponId) {
      return NextResponse.json(
        { error: 'Kupon ID gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Güncellenecek alanları belirle
    const updateData: any = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (typeof usageLimit === 'number') updateData.usageLimit = usageLimit;
    if (expiresAt) updateData.expiresAt = new Date(expiresAt);

    // Kuponu güncelle
    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      updateData,
      { new: true }
    ).populate('createdBy', 'email name');

    if (!coupon) {
      return NextResponse.json(
        { error: 'Kupon bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Kupon başarıyla güncellendi.',
      coupon: {
        id: coupon._id,
        code: coupon.code,
        creditAmount: coupon.creditAmount,
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
        expiresAt: coupon.expiresAt,
        createdBy: coupon.createdBy ? {
          id: coupon.createdBy._id,
          email: coupon.createdBy.email,
          name: coupon.createdBy.name,
        } : null,
        createdAt: coupon.createdAt,
      },
    });
  } catch (error) {
    console.error('Kupon güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kupon güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 