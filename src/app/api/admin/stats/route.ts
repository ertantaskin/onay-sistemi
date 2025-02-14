import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Tüm istatistikleri paralel olarak al
    const [totalUsers, totalCredits, totalApprovals, recentTransactions] =
      await Promise.all([
        // Toplam kullanıcı sayısı
        prisma.user.count(),

        // Toplam kredi miktarı
        prisma.user.aggregate({
          _sum: {
            credits: true,
          },
        }),

        // Toplam onay sayısı
        prisma.approval.count(),

        // Son kredi işlemleri
        prisma.creditTransaction.findMany({
          take: 20,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        }),
      ]);

    return NextResponse.json({
      totalUsers,
      totalCredits: totalCredits._sum?.credits || 0,
      totalApprovals,
      recentTransactions,
    });
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 