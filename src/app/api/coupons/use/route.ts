import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token) {
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

    // Kuponu bul
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: 'Geçersiz kupon kodu. Lütfen kodunuzu kontrol edin.' },
        { status: 400 }
      );
    }

    // Kuponun aktif olup olmadığını kontrol et
    if (!coupon.isActive) {
      return NextResponse.json(
        { error: 'Bu kupon artık geçerli değil. Başka bir kupon deneyebilirsiniz.' },
        { status: 400 }
      );
    }

    // Kuponun süresinin dolup dolmadığını kontrol et
    if (new Date() > new Date(coupon.expiresAt)) {
      return NextResponse.json(
        { error: 'Bu kuponun süresi dolmuş. Lütfen başka bir kupon deneyin.' },
        { status: 400 }
      );
    }

    // Kuponun kullanım limitini kontrol et
    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: 'Bu kupon maksimum kullanım limitine ulaşmış. Başka bir kupon deneyebilirsiniz.' },
        { status: 400 }
      );
    }

    // Kullanıcının daha önce bu kuponu kullanıp kullanmadığını kontrol et
    const previousUsage = await prisma.couponUsage.findFirst({
      where: {
        couponId: coupon.id,
        userId: token.sub!,
      },
    });

    if (previousUsage) {
      return NextResponse.json(
        { error: 'Bu kuponu daha önce kullandınız. Her kupon yalnızca bir kez kullanılabilir.' },
        { status: 400 }
      );
    }

    // Kullanıcının mevcut kredilerini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgileri alınamadı.' },
        { status: 404 }
      );
    }

    // Minimum kredi şartını kontrol et
    if (user.credits < coupon.minAmount) {
      return NextResponse.json(
        { error: `Bu kuponu kullanmak için minimum ${coupon.minAmount} krediye sahip olmalısınız.` },
        { status: 400 }
      );
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      // Kullanıcının kredilerini güncelle
      const updatedUser = await tx.user.update({
        where: { id: token.sub! },
        data: {
          credits: {
            increment: coupon.value,
          },
        },
      });

      // Kuponun kullanım sayısını artır
      const updatedCoupon = await tx.coupon.update({
        where: { id: coupon.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });

      // Kupon kullanım geçmişini kaydet
      await tx.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId: token.sub!,
          creditAmount: coupon.value,
        },
      });

      // Kredi işlem kaydı oluştur
      await tx.creditTransaction.create({
        data: {
          userId: token.sub!,
          type: 'coupon',
          amount: coupon.value,
          note: `"${coupon.code}" kodlu kupon kullanıldı`,
          couponId: coupon.id,
        },
      });

      return { updatedUser, updatedCoupon };
    });

    return NextResponse.json({
      success: true,
      message: `${coupon.value} kredi başarıyla hesabınıza eklendi!`,
      amount: coupon.value,
      newBalance: result.updatedUser.credits,
    });
  } catch (error) {
    console.error('Kupon kullanılırken hata:', error);
    return NextResponse.json(
      { error: 'Kupon kullanılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' },
      { status: 500 }
    );
  }
} 