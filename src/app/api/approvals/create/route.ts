import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Approval from '@/models/Approval';
import CreditTransaction from '@/models/CreditTransaction';

const APPROVAL_COST = 10; // Her onay için gerekli kredi miktarı

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { iidNumber, confirmationNumber } = await req.json();

    if (!iidNumber || !confirmationNumber) {
      return NextResponse.json(
        { error: 'IID numarası ve onay numarası gereklidir.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Kullanıcının yeterli kredisi var mı kontrol et
    const user = await User.findById(session.user.id);
    if (!user || user.credit < APPROVAL_COST) {
      return NextResponse.json(
        { error: 'Yeterli krediniz bulunmamaktadır.' },
        { status: 400 }
      );
    }

    // Onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber,
      confirmationNumber,
      status: 'success',
      createdAt: new Date(),
    });

    // Kredi işlemini oluştur
    await CreditTransaction.create({
      userId: session.user.id,
      amount: -APPROVAL_COST,
      type: 'approval',
      status: 'completed',
      description: `Onay alımı: ${iidNumber}`,
    });

    // Kullanıcının kredisini güncelle
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { credit: -APPROVAL_COST } },
      { new: true }
    );

    return NextResponse.json({
      message: 'Onay kaydı başarıyla oluşturuldu.',
      approval: {
        id: approval._id,
        confirmationNumber: approval.confirmationNumber,
        iidNumber: approval.iidNumber,
        status: approval.status,
        createdAt: approval.createdAt,
      },
      newBalance: updatedUser.credit,
    });
  } catch (error) {
    console.error('Onay kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 