import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Approval from '@/models/Approval';

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
    
    const count = await Approval.countDocuments({ userId: session.user.id });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Onay sayısı alma hatası:', error);
    return NextResponse.json(
      { error: 'Onay sayısı alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 