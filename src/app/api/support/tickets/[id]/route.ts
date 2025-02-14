import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Destek talebi detayını getir
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Bu işlem için giriş yapmanız gerekiyor.' }, { status: 401 });
    }

    const id = await Promise.resolve(context.params.id);

    const ticket = await prisma.ticket.findUnique({
      where: { 
        id,
        userId: session.user.id // Sadece kendi taleplerini görebilir
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        messages: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Destek talebi bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Destek talebi yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Destek talebi yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
} 