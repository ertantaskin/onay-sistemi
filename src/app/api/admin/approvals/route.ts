import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';
import User from '@/models/User';

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
    const status = searchParams.get('status');
    const skip = (page - 1) * limit;

    await dbConnect();

    // Arama kriterlerini oluştur
    const searchCriteria: any = {};
    if (search) {
      searchCriteria.$or = [
        { iidNumber: { $regex: search, $options: 'i' } },
        { confirmationNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) {
      searchCriteria.status = status;
    }

    // Toplam kayıt sayısını al
    const total = await Approval.countDocuments(searchCriteria);

    // Onayları getir
    const approvals = await Approval.find(searchCriteria)
      .populate('userId', 'email name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      approvals: approvals.map(approval => ({
        id: approval._id,
        user: {
          id: approval.userId._id,
          email: approval.userId.email,
          name: approval.userId.name,
        },
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
    console.error('Onay listesi hatası:', error);
    return NextResponse.json(
      { error: 'Onay listesi alınırken bir hata oluştu.' },
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

    const { approvalId, status } = await req.json();

    if (!approvalId || !status) {
      return NextResponse.json(
        { error: 'Onay ID ve durum gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Onayı güncelle
    const approval = await Approval.findByIdAndUpdate(
      approvalId,
      { status },
      { new: true }
    ).populate('userId', 'email name');

    if (!approval) {
      return NextResponse.json(
        { error: 'Onay bulunamadı.' },
        { status: 404 }
      );
    }

    // Eğer onay iptal edildiyse, kullanıcıya kredisini iade et
    if (status === 'cancelled') {
      await User.findByIdAndUpdate(
        approval.userId._id,
        { $inc: { credit: approval.creditUsed } }
      );
    }

    return NextResponse.json({
      message: 'Onay başarıyla güncellendi.',
      approval: {
        id: approval._id,
        user: {
          id: approval.userId._id,
          email: approval.userId.email,
          name: approval.userId.name,
        },
        confirmationNumber: approval.confirmationNumber,
        iidNumber: approval.iidNumber,
        productType: approval.productType,
        creditUsed: approval.creditUsed,
        status: approval.status,
        createdAt: approval.createdAt,
      },
    });
  } catch (error) {
    console.error('Onay güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Onay güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 