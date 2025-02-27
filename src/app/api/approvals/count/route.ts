import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Kullanıcı oturumunu kontrol et
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return new NextResponse(
        JSON.stringify({ error: 'Yetkisiz erişim' }),
        { status: 401 }
      );
    }
    
    // Kullanıcının onay sayısını getir
    const count = await prisma.approval.count({
      where: {
        userId: session.user.id
      }
    });
    
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Onay sayısı alınırken hata:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Sunucu hatası' }),
      { status: 500 }
    );
  }
} 