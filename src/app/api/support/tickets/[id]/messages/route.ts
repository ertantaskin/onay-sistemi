import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Destek talebine mesaj gönder
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Bu işlem için giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const { message } = await request.json();
    const id = await Promise.resolve(context.params.id);

    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    // Destek talebinin varlığını ve kullanıcıya ait olduğunu kontrol et
    const ticket = await prisma.ticket.findUnique({
      where: { 
        id,
        userId: session.user.id
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Destek talebi bulunamadı' },
        { status: 404 }
      );
    }

    if (ticket.status === 'closed') {
      return NextResponse.json(
        { error: 'Bu destek talebi kapatılmış' },
        { status: 400 }
      );
    }

    // Mesajı kaydet
    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        userId: session.user.id,
        message,
        isStaff: false,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Destek talebinin durumunu güncelle (eğer kapalı ise tekrar aç)
    if (ticket.status === 'closed') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'open' },
      });
    }

    return NextResponse.json(ticketMessage);
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    return NextResponse.json(
      { error: 'Mesaj gönderilirken hata oluştu' },
      { status: 500 }
    );
  }
} 