import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { iidNumber, confirmationNumber } = await req.json();

    if (!iidNumber || !confirmationNumber) {
      return NextResponse.json(
        { error: 'IID numarası ve onay numarası gereklidir.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul ve kredisini kontrol et
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    if (user.credit < 1) {
      return NextResponse.json(
        { error: 'Yetersiz kredi. Lütfen kredi yükleyin.' },
        { status: 402 }
      );
    }

    // Aynı IID numarası için önceki kaydı kontrol et
    const existingApproval = await prisma.approval.findFirst({
      where: {
        userId: session.user.id,
        iidNumber: iidNumber,
      }
    });

    if (existingApproval) {
      return NextResponse.json({
        message: 'Bu IID numarası için daha önce onay alınmış.',
        approval: {
          id: existingApproval.id,
          confirmationNumber: existingApproval.confirmationNumber,
          iidNumber: existingApproval.iidNumber,
          status: existingApproval.status,
          createdAt: existingApproval.createdAt,
        },
      });
    }

    // Transaction başlat
    const result = await prisma.$transaction(async (prisma) => {
      // Yeni onay kaydı oluştur
      const approval = await prisma.approval.create({
        data: {
          userId: session.user.id,
          iidNumber,
          confirmationNumber,
          status: 'success',
        }
      });

      // Kredi işlemi kaydı oluştur
      await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          type: 'usage',
          amount: -1,
        }
      });

      // Kullanıcının kredisini düş
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credit: { decrement: 1 } }
      });

      return approval;
    });

    return NextResponse.json({
      message: 'Onay kaydı başarıyla oluşturuldu.',
      approval: {
        id: result.id,
        confirmationNumber: result.confirmationNumber,
        iidNumber: result.iidNumber,
        status: result.status,
        createdAt: result.createdAt,
      },
    });
  } catch (error) {
    console.error('Onay kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Onay kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 