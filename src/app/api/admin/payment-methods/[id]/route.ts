import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

// DELETE /api/admin/payment-methods/[id]
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
      return new NextResponse('ID is required', { status: 400 });
    }

    // Ödeme yöntemini tamamen sil
    await prisma.paymentMethod.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Ödeme yöntemi başarıyla silindi' });
  } catch (error) {
    console.error('Ödeme yöntemi silinirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 