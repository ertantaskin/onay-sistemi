import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Belirli bir sayfa içeriğini getir
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const pageId = resolvedParams.id;

    const pageContent = await prisma.pageContent.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!pageContent) {
      return NextResponse.json(
        { error: "Sayfa içeriği bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(pageContent);
  } catch (error) {
    console.error("Sayfa içeriği getirilirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içeriği getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Sayfa içeriğini güncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const pageId = resolvedParams.id;

    const data = await req.json();

    // Gerekli alanları kontrol et
    if (!data.pageKey || !data.title || !data.description) {
      return NextResponse.json(
        { error: "Gerekli alanlar eksik" },
        { status: 400 }
      );
    }

    // Sayfa içeriğinin var olup olmadığını kontrol et
    const existingPage = await prisma.pageContent.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: "Sayfa içeriği bulunamadı" },
        { status: 404 }
      );
    }

    // pageKey değiştiyse, yeni pageKey'in benzersiz olup olmadığını kontrol et
    if (data.pageKey !== existingPage.pageKey) {
      const pageWithSameKey = await prisma.pageContent.findUnique({
        where: {
          pageKey: data.pageKey,
        },
      });

      if (pageWithSameKey) {
        return NextResponse.json(
          { error: "Bu sayfa anahtarı zaten kullanılıyor" },
          { status: 400 }
        );
      }
    }

    // Sayfa içeriğini güncelle
    const updatedPageContent = await prisma.pageContent.update({
      where: {
        id: pageId,
      },
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

    return NextResponse.json(updatedPageContent);
  } catch (error) {
    console.error("Sayfa içeriği güncellenirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içeriği güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// Sayfa içeriğini sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Next.js 15'te params'ı await ile bekletmemiz gerekiyor
    const resolvedParams = await params;
    const pageId = resolvedParams.id;

    // Sayfa içeriğinin var olup olmadığını kontrol et
    const existingPage = await prisma.pageContent.findUnique({
      where: {
        id: pageId,
      },
    });

    if (!existingPage) {
      return NextResponse.json(
        { error: "Sayfa içeriği bulunamadı" },
        { status: 404 }
      );
    }

    // Sayfa içeriğini sil
    await prisma.pageContent.delete({
      where: {
        id: pageId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Sayfa içeriği silinirken hata oluştu:", error);
    return NextResponse.json(
      { error: "Sayfa içeriği silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 