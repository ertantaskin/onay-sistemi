import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const transactions = await prisma.creditTransaction.findMany({
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Kredi işlemleri yüklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 