import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Kullanıcının kredi bakiyesini getir
export async function GET(req: NextRequest) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Bu işlem için giriş yapmanız gerekmektedir." },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini getir
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı." },
        { status: 404 }
      );
    }

    return NextResponse.json({ credits: user.credits });
  } catch (error) {
    console.error("Kullanıcı kredileri getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Kullanıcı kredileri getirilirken bir hata oluştu." },
      { status: 500 }
    );
  }
} 