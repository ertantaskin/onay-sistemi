import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

    const { iidNumber, productType } = await req.json();

    if (!iidNumber || !productType) {
      return NextResponse.json(
        { error: 'IID numarası ve ürün tipi gereklidir.' },
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

    // Onay numarası oluştur (örnek: rastgele 8 haneli numara)
    const confirmationNumber = Math.floor(10000000 + Math.random() * 90000000).toString();

    // Onay kaydı oluştur
    const approval = await Approval.create({
      userId: session.user.id,
      iidNumber,
      confirmationNumber,
      productType,
      creditUsed: APPROVAL_COST,
      status: 'completed',
    });

    // Kredi işlemini oluştur
    const transaction = await CreditTransaction.create({
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
      message: 'Onay başarıyla alındı.',
      approval: {
        id: approval._id,
        confirmationNumber: approval.confirmationNumber,
        iidNumber: approval.iidNumber,
        productType: approval.productType,
        creditUsed: approval.creditUsed,
        createdAt: approval.createdAt,
      },
      newBalance: updatedUser.credit,
    });
  } catch (error) {
    console.error('Onay alma hatası:', error);
    return NextResponse.json(
      { error: 'Onay alma işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 