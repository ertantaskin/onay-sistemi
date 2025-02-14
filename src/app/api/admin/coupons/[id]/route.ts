import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return new NextResponse('Kupon ID\'si gereklidir', { status: 400 });
    }

    // Kuponu silmek yerine pasife çek
    await prisma.coupon.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return new NextResponse('Kupon başarıyla silindi', { status: 200 });
  } catch (error) {
    console.error('Kupon silinirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 