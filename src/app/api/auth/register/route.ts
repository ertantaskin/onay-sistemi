import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Gerekli alanları kontrol et
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Tüm alanların doldurulması zorunludur.' },
        { status: 400 }
      );
    }

    // Veritabanına bağlan
    await dbConnect();

    // Email kullanımda mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanımda.' },
        { status: 400 }
      );
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      email,
      password, // Model içinde hash'lenecek
      name,
      role: 'user',
      credit: 0,
      isActive: true,
    });

    return NextResponse.json(
      {
        message: 'Kullanıcı başarıyla oluşturuldu.',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return NextResponse.json(
      { error: 'Kayıt işlemi sırasında bir hata oluştu.' },
      { status: 500 }
    );
  }
} 