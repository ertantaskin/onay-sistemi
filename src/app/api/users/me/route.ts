import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id).select('credit email name');

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credit: user.credit
      }
    });
  } catch (error) {
    console.error('Kullanıcı bilgileri hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 