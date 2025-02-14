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

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filtreleme koşullarını oluştur
    const where: any = {};

    if (search) {
      where.OR = [
        { iidNumber: { contains: search, mode: 'insensitive' } },
        { confirmationNumber: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ]
        }},
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const approvals = await prisma.approval.findMany({
      where,
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

    return NextResponse.json(approvals);
  } catch (error) {
    console.error('Onaylar yüklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Onayı bul
    const approval = await prisma.approval.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!approval) {
      return new NextResponse('Onay bulunamadı', { status: 404 });
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      // Onay durumunu güncelle
      const updatedApproval = await tx.approval.update({
        where: { id },
        data: { status },
      });

      // Eğer onay başarılı ise ve önceki durum başarılı değilse kredi ekle
      if (status === 'success' && approval.status !== 'success') {
        // Kredi işlemi oluştur
        await tx.creditTransaction.create({
          data: {
            userId: approval.userId,
            type: 'usage',
            amount: -1, // Her onay 1 kredi kullanır
            note: `IID: ${approval.iidNumber} onayı için kredi kullanıldı`,
          },
        });

        // Kullanıcının kredisini güncelle
        await tx.user.update({
          where: { id: approval.userId },
          data: {
            credits: {
              decrement: 1,
            },
          },
        });
      }
      // Eğer onay başarısız/beklemede ise ve önceki durum başarılı ise krediyi iade et
      else if (status !== 'success' && approval.status === 'success') {
        // Kredi iadesi işlemi oluştur
        await tx.creditTransaction.create({
          data: {
            userId: approval.userId,
            type: 'refund',
            amount: 1,
            note: `IID: ${approval.iidNumber} onayı iptal edildiği için kredi iadesi`,
          },
        });

        // Kullanıcının kredisini güncelle
        await tx.user.update({
          where: { id: approval.userId },
          data: {
            credits: {
              increment: 1,
            },
          },
        });
      }

      return updatedApproval;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Onay güncellenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 