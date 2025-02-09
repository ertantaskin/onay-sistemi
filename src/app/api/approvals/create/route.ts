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

    // Aynı IID numarası için önceki kaydı kontrol et
    const existingApproval = await Approval.findOne({
      userId: session.user.id,
      iidNumber: iidNumber,
    });

    if (existingApproval) {
      console.log('Bu IID numarası için önceki kayıt bulundu:', {
        id: existingApproval._id,
        userId: existingApproval.userId,
        iidNumber: existingApproval.iidNumber,
      });
      
      return NextResponse.json({
        message: 'Bu IID numarası için daha önce onay alınmış.',
        approval: {
          id: existingApproval._id,
          confirmationNumber: existingApproval.confirmationNumber,
          iidNumber: existingApproval.iidNumber,
          status: existingApproval.status,
          createdAt: existingApproval.createdAt,
        },
      });
    }

    // Yeni onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber,
      confirmationNumber,
      status: 'success',
      createdAt: new Date(),
    });

    console.log('Yeni onay kaydı oluşturuldu:', {
      id: approval._id,
      userId: approval.userId,
      iidNumber: approval.iidNumber,
      confirmationNumber: approval.confirmationNumber,
      status: approval.status,
      createdAt: approval.createdAt,
    });

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
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Onay kaydedilirken bir hata oluştu: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 