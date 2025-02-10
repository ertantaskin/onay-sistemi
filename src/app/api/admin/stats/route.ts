import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Toplam kullanıcı sayısı
    const totalUsers = await prisma.user.count();

    // Toplam onay sayısı
    const totalApprovals = await prisma.approval.count();

    // Toplam kredi işlemi
    const totalTransactions = await prisma.creditTransaction.count();

    // Son 7 günlük istatistikler
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentStats = await prisma.$transaction([
      // Son 7 günlük yeni kullanıcılar
      prisma.user.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      // Son 7 günlük onaylar
      prisma.approval.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      }),
      // Son 7 günlük kredi işlemleri
      prisma.creditTransaction.count({
        where: {
          createdAt: {
            gte: sevenDaysAgo
          }
        }
      })
    ]);

    return NextResponse.json({
      totalStats: {
        users: totalUsers,
        approvals: totalApprovals,
        transactions: totalTransactions
      },
      recentStats: {
        newUsers: recentStats[0],
        newApprovals: recentStats[1],
        newTransactions: recentStats[2]
      }
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 