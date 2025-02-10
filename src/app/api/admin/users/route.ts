import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Toplam kayıt sayısını al
    const total = await prisma.user.count();

    // Kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        credit: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            approvals: true,
            creditTransactions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    return NextResponse.json({
      users: users.map(user => ({
        ...user,
        totalApprovals: user._count.approvals,
        totalTransactions: user._count.creditTransactions
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı listesi alınırken bir hata oluştu.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      );
    }

    const { id, credit, role } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID\'si gereklidir.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı güncelle
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(credit !== undefined && { credit }),
        ...(role !== undefined && { role })
      },
      select: {
        id: true,
        name: true,
        email: true,
        credit: true,
        role: true,
        createdAt: true
      }
    });

    if (credit !== undefined) {
      // Kredi işlemi kaydı oluştur
      await prisma.creditTransaction.create({
        data: {
          userId: id,
          type: credit > 0 ? 'deposit' : 'refund',
          amount: Math.abs(credit)
        }
      });
    }

    return NextResponse.json({
      message: 'Kullanıcı başarıyla güncellendi.',
      user
    });
  } catch (error) {
    console.error('Kullanıcı güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 