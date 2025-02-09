import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';
import User from '@/models/User';

export async function POST(req: Request) {
  console.log('Onay kaydetme isteği alındı');
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      console.log('Oturum bulunamadı');
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    console.log('Kullanıcı oturumu:', {
      userId: session.user.id,
      email: session.user.email
    });

    const { iidNumber, confirmationNumber } = await req.json();
    console.log('İstek verileri:', { iidNumber, confirmationNumber });

    if (!iidNumber || !confirmationNumber) {
      console.log('Eksik veri');
      return NextResponse.json(
        { error: 'IID numarası ve onay numarası gereklidir.' },
        { status: 400 }
      );
    }

    console.log('Veritabanı bağlantısı başlatılıyor...');
    await dbConnect();
    console.log('Veritabanı bağlantısı başarılı');

    // Kullanıcının kredisini kontrol et
    const user = await User.findById(session.user.id);
    console.log('Kullanıcı bilgileri:', {
      id: user?._id,
      credit: user?.credit,
      found: !!user
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı');
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    if (user.credit < 1) {
      console.log('Yetersiz kredi');
      return NextResponse.json(
        { error: 'Yetersiz kredi. Lütfen kredi yükleyin.' },
        { status: 400 }
      );
    }

    // Aynı IID numarası için önceki kaydı kontrol et
    const existingApproval = await Approval.findOne({
      userId: session.user.id,
      iidNumber: iidNumber,
    });

    if (existingApproval) {
      console.log('Mevcut onay kaydı bulundu:', {
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

    console.log('Yeni onay kaydı oluşturuluyor...');
    
    // Yeni onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber,
      confirmationNumber,
      status: 'success',
    });

    console.log('Onay kaydı oluşturuldu:', {
      id: approval._id,
      userId: approval.userId,
      iidNumber: approval.iidNumber,
      confirmationNumber: approval.confirmationNumber,
    });

    // Kullanıcının kredisini düş
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { credit: -1 } },
      { new: true }
    );

    console.log('Kullanıcı kredisi güncellendi:', {
      id: updatedUser?._id,
      newCredit: updatedUser?.credit
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