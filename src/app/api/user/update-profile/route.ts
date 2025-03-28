import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

interface ProfileUpdateBody {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekmektedir" },
        { status: 401 }
      );
    }

    const body: ProfileUpdateBody = await request.json();
    
    // Kullanıcıyı veritabanından al
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true, 
        email: true,
        password: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Güncelleme işlemleri için veri hazırla
    const updateData: any = {};
    
    // İsim değişikliği
    if (body.name && body.name !== user.name) {
      updateData.name = body.name;
    }
    
    // Email değişikliği
    if (body.email && body.email !== user.email) {
      // Email biçimi doğrulama
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: "Geçersiz e-posta adresi formatı" },
          { status: 400 }
        );
      }
      
      // Email zaten kullanılıyor mu kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email: body.email }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten kullanılmaktadır" },
          { status: 409 }
        );
      }
      
      updateData.email = body.email;
    }
    
    // Şifre değişikliği
    if (body.currentPassword && body.newPassword) {
      // Mevcut şifre doğru mu?
      const isPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Mevcut şifreniz yanlış" },
          { status: 400 }
        );
      }
      
      // Yeni şifre geçerli mi?
      if (body.newPassword.length < 6) {
        return NextResponse.json(
          { error: "Yeni şifre en az 6 karakter olmalıdır" },
          { status: 400 }
        );
      }
      
      // Şifreyi hashle
      const hashedPassword = await bcrypt.hash(body.newPassword, 10);
      updateData.password = hashedPassword;
    }
    
    // Eğer güncelleme için veri yoksa hata döndür
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Güncelleme için değişiklik yapılmadı" },
        { status: 400 }
      );
    }
    
    // Kullanıcıyı güncelle
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    return NextResponse.json({
      message: "Profil başarıyla güncellendi",
      user: {
        name: updatedUser.name,
        email: updatedUser.email
      }
    });
    
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 