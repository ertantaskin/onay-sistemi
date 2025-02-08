import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import CreditTransaction from '@/models/CreditTransaction';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { amount, paymentMethod } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Geçerli bir kredi miktarı giriniz.' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Kredi işlemini oluştur
    const transaction = await CreditTransaction.create({
      userId: session.user.id,
      amount,
      type: 'deposit',
      status: 'completed',
      paymentMethod,
      description: 'Kredi yükleme',
    });

    // Kullanıcının kredisini güncelle
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { credit: amount } },
      { new: true }
    );

    return NextResponse.json({
      message: 'Kredi başarıyla yüklendi.',
      transaction: {
        id: transaction._id,
        amount,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
      newBalance: user.credit,
    });
  } catch (error) {
    console.error('Kredi yükleme hatası:', error);
    return NextResponse.json(
      { error: 'Kredi yükleme işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 