import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET() {
  try {
    // Session kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Veritabanı bağlantısı
    await dbConnect();
    
    // Sadece credit alanını seç
    const user = await User.findById(session.user.id)
      .select('credit')
      .lean()
      .exec();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Cache-Control header'ı ekle
    return new NextResponse(
      JSON.stringify({ credit: user.credit }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, s-maxage=10'
        }
      }
    );
    
  } catch (error) {
    console.error('API hatası:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 