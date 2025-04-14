import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Belirli bir SEO ayarını getir
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Parametre erişimini doğru şekilde yap
    const id = context.params.id;
    console.log("SEO ID:", id);

    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    const seoSettings = await prisma.seoSettings.findUnique({
      where: { id },
    });

    if (!seoSettings) {
      return NextResponse.json(
        { error: "SEO ayarı bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(seoSettings);
  } catch (error) {
    console.error("SEO ayarı getirme hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarı getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Belirli bir SEO ayarını güncelle
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Parametre erişimini doğru şekilde yap
    const id = context.params.id;
    console.log("SEO Güncelleme ID:", id);
    
    const data = await req.json();

    // SEO ayarının var olduğunu kontrol et
    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    const existingSeo = await prisma.seoSettings.findUnique({
      where: { id },
    });

    if (!existingSeo) {
      return NextResponse.json(
        { error: "Güncellenecek SEO ayarı bulunamadı" },
        { status: 404 }
      );
    }

    // SEO ayarını güncelle
    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    const updatedSeoSettings = await prisma.seoSettings.update({
      where: { id },
      data: {
        pageUrl: data.pageUrl || existingSeo.pageUrl,
        pageType: data.pageType || existingSeo.pageType,
        title: data.title || existingSeo.title,
        description: data.description || existingSeo.description,
        keywords: data.keywords !== undefined ? data.keywords : existingSeo.keywords,
        ogTitle: data.ogTitle !== undefined ? data.ogTitle : existingSeo.ogTitle,
        ogDesc: data.ogDesc !== undefined ? data.ogDesc : existingSeo.ogDesc,
        ogImage: data.ogImage !== undefined ? data.ogImage : existingSeo.ogImage,
        canonical: data.canonical !== undefined ? data.canonical : existingSeo.canonical,
        robots: data.robots !== undefined ? data.robots : existingSeo.robots,
        schema: data.schema !== undefined ? data.schema : existingSeo.schema,
        isActive: data.isActive !== undefined ? data.isActive : existingSeo.isActive,
      },
    });

    return NextResponse.json(updatedSeoSettings);
  } catch (error) {
    console.error("SEO ayarı güncelleme hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarı güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE - Belirli bir SEO ayarını sil
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Parametre erişimini doğru şekilde yap
    const id = context.params.id;
    console.log("SEO Silme ID:", id);

    // SEO ayarının var olduğunu kontrol et
    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    const existingSeo = await prisma.seoSettings.findUnique({
      where: { id },
    });

    if (!existingSeo) {
      return NextResponse.json(
        { error: "Silinecek SEO ayarı bulunamadı" },
        { status: 404 }
      );
    }

    // SEO ayarını sil
    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    await prisma.seoSettings.delete({
      where: { id },
    });

    return NextResponse.json({ message: "SEO ayarı başarıyla silindi" });
  } catch (error) {
    console.error("SEO ayarı silme hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarı silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 