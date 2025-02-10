import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import CreditTransaction from '@/models/CreditTransaction';

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

    await dbConnect();

    // Kuponu bul
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Geçersiz veya kullanılmış kupon kodu.' },
        { status: 400 }
      );
    }

    // Kuponun süresinin dolup dolmadığını kontrol et
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: 'Bu kuponun süresi dolmuş.' },
        { status: 400 }
      );
    }

    // Kullanım limitini kontrol et
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: 'Bu kupon maksimum kullanım limitine ulaşmış.' },
        { status: 400 }
      );
    }

    // Kredi işlemini oluştur
    const transaction = await CreditTransaction.create({
      userId: session.user.id,
      amount: coupon.creditAmount,
      type: 'coupon',
      status: 'completed',
      couponCode: code,
      description: 'Kupon ile kredi yükleme',
    });

    // Kullanıcının kredisini güncelle
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { credit: coupon.creditAmount } },
      { new: true }
    );

    // Kuponun kullanım sayısını artır
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { usedCount: 1 },
    });

    return NextResponse.json({
      message: 'Kupon başarıyla kullanıldı.',
      transaction: {
        id: transaction._id,
        amount: coupon.creditAmount,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: user.credit,
    });
  } catch (error) {
    console.error('Kupon kullanma hatası:', error);
    return NextResponse.json(
      { error: 'Kupon kullanma işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 