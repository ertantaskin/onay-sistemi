import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Approval from '@/models/Approval';
import CreditTransaction from '@/models/CreditTransaction';
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

    await dbConnect();

    // Genel istatistikler
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalApprovals = await Approval.countDocuments();
    const totalCoupons = await Coupon.countDocuments();

    // Son 7 günlük istatistikler
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    const recentApprovals = await Approval.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Kredi işlemleri istatistikleri
    const creditStats = await CreditTransaction.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Onay durumu istatistikleri
    const approvalStats = await Approval.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Günlük onay sayıları (son 7 gün)
    const dailyApprovals = await Approval.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Günlük kredi işlemleri (son 7 gün)
    const dailyTransactions = await CreditTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return NextResponse.json({
      general: {
        totalUsers,
        activeUsers,
        totalApprovals,
        totalCoupons,
        newUsers,
        recentApprovals,
      },
      creditStats: creditStats.reduce((acc, stat) => {
        acc[stat._id] = {
          total: stat.total,
          count: stat.count,
        };
        return acc;
      }, {}),
      approvalStats: approvalStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      charts: {
        dailyApprovals: dailyApprovals.map(day => ({
          date: day._id,
          count: day.count,
        })),
        dailyTransactions: dailyTransactions.map(day => ({
          date: day._id,
          total: day.total,
          count: day.count,
        })),
      },
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    return NextResponse.json(
      { error: 'İstatistikler alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 