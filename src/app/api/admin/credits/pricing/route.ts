import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

// GET /api/admin/credits/pricing
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const packages = await prisma.creditPackage.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error('Kredi paketleri yüklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST /api/admin/credits/pricing
export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { name, credits, price, paymentMethodId } = data;

    if (!name || !credits || !price || !paymentMethodId) {
      return new NextResponse('Eksik bilgi', { status: 400 });
    }

    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod) {
      return new NextResponse('Geçersiz ödeme yöntemi', { status: 400 });
    }

    const newPackage = await prisma.creditPackage.create({
      data: {
        name,
        credits: Number(credits),
        price: Number(price),
        paymentMethodId,
        isActive: true,
      },
      include: {
        paymentMethod: true,
      },
    });

    return NextResponse.json(newPackage);
  } catch (error) {
    console.error('Kredi paketi oluşturulurken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// PATCH /api/admin/credits/pricing/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const data = await request.json();
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Paket ID\'si gerekli' },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Paket bulunamadı' },
        { status: 404 }
      );
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
    return NextResponse.json(
      { error: 'Kredi paketi güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/credits/pricing/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Oturum açmanız gerekiyor' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Bu işlem için yetkiniz yok' }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Paket ID\'si gerekli' },
        { status: 400 }
      );
    }

    const existingPackage = await prisma.creditPackage.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Paket bulunamadı' },
        { status: 404 }
      );
    }

    await prisma.creditPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kredi paketi silinirken hata:', error);
    return NextResponse.json(
      { error: 'Kredi paketi silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 