import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.error('Oturum bilgisi eksik veya geçersiz');
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { iidNumber, confirmationNumber } = await req.json();

    if (!iidNumber || !confirmationNumber) {
      console.error('Eksik veri:', { iidNumber, confirmationNumber });
      return NextResponse.json(
        { error: 'IID numarası ve onay numarası gereklidir.' },
        { status: 400 }
      );
    }

    console.log('Veritabanı bağlantısı başlatılıyor...');
    const db = await dbConnect();
    console.log('Veritabanı bağlantısı başarılı:', !!db);

    // Aynı IID numarası için önceki kaydı kontrol et
    const existingApproval = await Approval.findOne({
      userId: session.user.id,
      iidNumber: iidNumber,
    }).exec();

    if (existingApproval) {
      console.log('Bu IID numarası için önceki kayıt bulundu:', {
        id: existingApproval._id,
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

    console.log('Yeni onay kaydı oluşturuluyor...');
    // Yeni onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber: iidNumber.trim(),
      confirmationNumber: confirmationNumber.trim(),
      status: 'success',
    });

    console.log('Yeni onay kaydı oluşturuldu:', {
      id: approval._id,
      iidNumber: approval.iidNumber,
      status: approval.status,
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 