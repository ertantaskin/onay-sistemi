import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await dbConnect();

    // Toplam kayıt sayısını al
    const total = await Approval.countDocuments({ userId: session.user.id });

    // Onay geçmişini getir
    const approvals = await Approval.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      approvals: approvals.map(approval => ({
        id: approval._id,
        confirmationNumber: approval.confirmationNumber,
        iidNumber: approval.iidNumber,
        productType: approval.productType,
        creditUsed: approval.creditUsed,
        status: approval.status,
        createdAt: approval.createdAt,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Onay geçmişi hatası:', error);
    return NextResponse.json(
      { error: 'Onay geçmişi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 