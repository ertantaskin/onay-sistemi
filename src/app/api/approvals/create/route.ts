import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';

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

    // Onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber,
      confirmationNumber,
      status: 'success',
    });

    console.log('Yeni onay kaydı oluşturuldu:', approval);

    return NextResponse.json({
      message: 'Onay kaydı başarıyla oluşturuldu.',
      approval: {
        id: approval._id,
        confirmationNumber: approval.confirmationNumber,
        iidNumber: approval.iidNumber,
        status: approval.status,
        createdAt: approval.createdAt,
      },
    });
  } catch (error) {
    console.error('Onay kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 