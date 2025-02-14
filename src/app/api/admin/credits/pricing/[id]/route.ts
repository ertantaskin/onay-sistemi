import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// DELETE /api/admin/credits/pricing/[id]
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
      return new NextResponse('Paket ID\'si gerekli', { status: 400 });
    }

    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return new NextResponse('Paket bulunamadı', { status: 404 });
    }

    // Paketi tamamen sil
    await prisma.creditPackage.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Paket başarıyla silindi' });
  } catch (error) {
    console.error('Kredi paketi silinirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    if (!id) {
      return new NextResponse('Paket ID\'si gerekli', { status: 400 });
    }

    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return new NextResponse('Paket bulunamadı', { status: 404 });
    }

    const updatedPackage = await prisma.creditPackage.update({
      where: { id },
      data: {
        name: data.name,
        credits: data.credits ? Number(data.credits) : undefined,
        price: data.price ? Number(data.price) : undefined,
        paymentMethodId: data.paymentMethodId,
        isActive: data.isActive !== undefined ? data.isActive : undefined,
      },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Kredi paketi güncellenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 