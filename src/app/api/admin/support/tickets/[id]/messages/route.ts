import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { NextRequest } from 'next/server';

// Destek talebine mesaj gönder
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { message } = await request.json();
    const id = await Promise.resolve(params.id);

    if (!message) {
      return NextResponse.json(
        { error: 'Mesaj içeriği gerekli' },
        { status: 400 }
      );
    }

    // Destek talebinin varlığını ve durumunu kontrol et
    const ticket = await prisma.ticket.findUnique({
      where: { id },
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
        userId: user.id,
        message,
        isStaff: true,
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

    // Destek talebinin durumunu güncelle (eğer açık ise işlemde olarak işaretle)
    if (ticket.status === 'open') {
      await prisma.ticket.update({
        where: { id },
        data: { status: 'in_progress' },
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