import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Kullanıcının destek taleplerini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Bu işlem için giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const tickets = await prisma.ticket.findMany({
      where: { userId: session.user.id },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Destek talepleri yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Destek talepleri yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// Yeni destek talebi oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Bu işlem için giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { subject, categoryId, priority, message } = await request.json();

    if (!subject || !categoryId || !message) {
      return NextResponse.json(
        { error: 'Konu, kategori ve mesaj alanları zorunludur.' },
        { status: 400 }
      );
    }

    // Kategoriyi kontrol et
    const category = await prisma.supportCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || !category.isActive) {
      return NextResponse.json(
        { error: 'Geçersiz veya pasif kategori.' },
        { status: 400 }
      );
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (tx) => {
      // Destek talebini oluştur
      const ticket = await tx.ticket.create({
        data: {
          userId: session.user.id,
          categoryId,
          subject,
          priority: priority || 'normal',
          status: 'open',
        },
        include: {
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      // İlk mesajı ekle
      await tx.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          userId: session.user.id,
          message,
          isStaff: false,
        },
      });

      return ticket;
    });

    return NextResponse.json({
      message: 'Destek talebi başarıyla oluşturuldu.',
      ticket: result,
    });
  } catch (error) {
    console.error('Destek talebi oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Destek talebi oluşturulurken bir hata oluştu.' },
      { status: 500 }
    );
  }
}