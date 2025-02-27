import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Tüm sayfa içeriklerini getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const pageContents = await prisma.pageContent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pageContents);
  } catch (error) {
    console.error("Sayfa içerikleri getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içerikleri getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Yeni sayfa içeriği oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();

    // Gerekli alanları kontrol et
    if (!data.pageKey || !data.title || !data.description) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // pageKey'in benzersiz olup olmadığını kontrol et
    const existingPage = await prisma.pageContent.findUnique({
      where: {
        pageKey: data.pageKey,
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "Bu sayfa anahtarı zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Yeni sayfa içeriği oluştur
    const newPageContent = await prisma.pageContent.create({
      data: {
        pageKey: data.pageKey,
        title: data.title,
        description: data.description,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        content: data.content || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(newPageContent);
  } catch (error) {
    console.error("Sayfa içeriği oluşturulurken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içeriği oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 