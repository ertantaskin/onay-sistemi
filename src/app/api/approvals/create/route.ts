import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';
import User from '@/models/User';
import mongoose from 'mongoose';

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

    // MongoDB bağlantısını kur
    await dbConnect();

    // MongoDB oturumunu başlat
    const session_db = await mongoose.startSession();
    session_db.startTransaction();

    try {
      // Kullanıcıyı bul ve kredisini kontrol et
      const user = await User.findById(session.user.id).session(session_db);

      if (!user) {
        await session_db.abortTransaction();
        return NextResponse.json(
          { error: 'Kullanıcı bulunamadı.' },
          { status: 404 }
        );
      }

      if (user.credit < 1) {
        await session_db.abortTransaction();
        return NextResponse.json(
          { error: 'Yetersiz kredi. Lütfen kredi yükleyin.' },
          { status: 400 }
        );
      }

      // Aynı IID numarası için önceki kaydı kontrol et
      const existingApproval = await Approval.findOne({
        userId: session.user.id,
        iidNumber: iidNumber,
      }).session(session_db);

      if (existingApproval) {
        await session_db.abortTransaction();
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
      const approval = await Approval.create([{
        userId: session.user.id,
        iidNumber,
        confirmationNumber,
        status: 'success',
      }], { session: session_db });

      // Kullanıcının kredisini düş
      await User.findByIdAndUpdate(
        session.user.id,
        { $inc: { credit: -1 } },
        { new: true, session: session_db }
      );

      // İşlemi onayla
      await session_db.commitTransaction();

      return NextResponse.json({
        message: 'Onay kaydı başarıyla oluşturuldu.',
        approval: {
          id: approval[0]._id,
          confirmationNumber: approval[0].confirmationNumber,
          iidNumber: approval[0].iidNumber,
          status: approval[0].status,
          createdAt: approval[0].createdAt,
        },
      });
    } catch (error) {
      await session_db.abortTransaction();
      throw error;
    } finally {
      session_db.endSession();
    }
  } catch (error) {
    console.error('Onay kayıt hatası:', error);
    
    if (error instanceof mongoose.Error) {
      return NextResponse.json(
        { error: 'Veritabanı işlemi sırasında bir hata oluştu.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 