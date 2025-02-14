import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, amount, note, type } = await req.json();

    if (!userId || !amount) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      // Kredi işlemini kaydet
      const transaction = await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          type: type || 'admin_add',
          note: note || 'Admin tarafından eklendi',
        },
      });

      // Kullanıcının kredisini güncelle
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      return { transaction, updatedUser };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Kredi eklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 