import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const searchQuery = req.nextUrl.searchParams.get('search');

    const users = await prisma.user.findMany({
      where: searchQuery ? {
        OR: [
          { email: { contains: searchQuery, mode: 'insensitive' } },
          { name: { contains: searchQuery, mode: 'insensitive' } },
        ],
      } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            approvals: true,
            creditTransactions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Kullanıcılar yüklenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id, role, credit, name, email, password } = await req.json();

    if (!id) {
      return new NextResponse('Kullanıcı ID\'si gereklidir', { status: 400 });
    }

    // Email değişikliği varsa, benzersiz olduğunu kontrol et
    if (email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== id) {
        return new NextResponse('Bu email adresi başka bir kullanıcı tarafından kullanılıyor', { status: 400 });
      }
    }

    // Kullanıcının mevcut durumunu kontrol et
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { credits: true },
    });

    if (!existingUser) {
      return new NextResponse('Kullanıcı bulunamadı', { status: 404 });
    }

    // Kredi değişimi varsa işlem kaydı oluştur
    if (credit !== undefined && credit !== existingUser.credits) {
      const creditDifference = credit - existingUser.credits;
      await prisma.creditTransaction.create({
        data: {
          userId: id,
          type: 'admin_update',
          amount: Math.abs(creditDifference),
          note: `Admin tarafından kredi ${creditDifference > 0 ? 'eklendi' : 'düşüldü'}`,
        },
      });
    }

    // Şifre varsa hashle
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(credit !== undefined && { credits: credit }),
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(hashedPassword !== undefined && { password: hashedPassword }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        credits: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            approvals: true,
            creditTransactions: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = await getToken({ req });

    if (!token || token.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await req.json();

    if (!id) {
      return new NextResponse('Kullanıcı ID\'si gereklidir', { status: 400 });
    }

    // Kullanıcıyı sil
    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse('Kullanıcı başarıyla silindi', { status: 200 });
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 