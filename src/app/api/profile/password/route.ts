import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Mevcut şifre ve yeni şifre gereklidir.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Yeni şifre en az 6 karakter olmalıdır.' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      );
    }

    // Mevcut şifreyi kontrol et
    const isValid = await compare(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mevcut şifre yanlış.' },
        { status: 400 }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await hash(newPassword, 12);

    // Şifreyi güncelle
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      message: 'Şifreniz başarıyla güncellendi.'
    });
  } catch (error) {
    console.error('Şifre güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Şifre güncellenirken bir hata oluştu.' },
      { status: 500 }
    );
  }
} 