import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { Prisma, Coupon, CreditTransaction, User } from '@prisma/client';
import { NextRequest } from 'next/server';

type CouponWithTransactions = Coupon & {
  transactions?: (CreditTransaction & {
    user: Pick<User, 'name' | 'email'>;
  })[];
};

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token || token.role !== 'admin') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');
    const includeUsages = searchParams.get('includeUsages') === 'true';

    const where: Prisma.CouponWhereInput = search ? {
      code: {
        contains: search,
        mode: 'insensitive' as Prisma.QueryMode
      }
    } : {};

    const coupons = await prisma.coupon.findMany({
      where,
      include: includeUsages ? {
        transactions: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      } : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Kupon kullanım detaylarını düzenle
    const formattedCoupons = coupons.map((coupon: CouponWithTransactions) => {
      const { transactions, ...rest } = coupon;
      return {
        ...rest,
        usages: transactions?.map(transaction => ({
          id: transaction.id,
          userId: transaction.userId,
          creditAmount: transaction.amount,
          createdAt: transaction.createdAt,
          user: transaction.user
        }))
      };
    });

    return NextResponse.json(formattedCoupons);
  } catch (error) {
    console.error('Kuponlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Kuponlar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { code, value, minAmount, maxUses, expiresAt } = await req.json();

    if (!code || !value || !maxUses || !expiresAt) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Kupon kodunun benzersiz olduğunu kontrol et
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      return new NextResponse('Bu kupon kodu zaten kullanılıyor', { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        value,
        minAmount,
        maxUses,
        expiresAt: new Date(expiresAt),
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Kupon oluşturulurken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, isActive } = await req.json();

    if (!id) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const coupon = await prisma.coupon.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Kupon güncellenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return new NextResponse('Kupon başarıyla silindi', { status: 200 });
  } catch (error) {
    console.error('Kupon silinirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 