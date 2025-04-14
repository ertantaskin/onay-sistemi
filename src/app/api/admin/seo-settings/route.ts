import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - Tüm SEO ayarlarını getir
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    // Query parametreleri
    const url = new URL(req.url);
    const pageType = url.searchParams.get("pageType");
    const queryFilter = pageType ? { pageType } : {};

    const seoSettings = await (prisma as any).seoSettings.findMany({
      where: queryFilter,
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(seoSettings);
  } catch (error) {
    console.error("SEO ayarlarını getirme hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarları getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST - Yeni SEO ayarı oluştur
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const data = await req.json();
    
    // Gerekli alanları kontrol et
    if (!data.pageUrl || !data.title || !data.description) {
      return NextResponse.json(
        { error: "Sayfa URL'si, başlık ve açıklama zorunludur" },
        { status: 400 }
      );
    }

    // URL'nin benzersiz olduğunu kontrol et
    const existingSeo = await (prisma as any).seoSettings.findUnique({
      where: { pageUrl: data.pageUrl },
    });

    if (existingSeo) {
      return NextResponse.json(
        { error: "Bu URL için zaten bir SEO ayarı mevcut" },
        { status: 400 }
      );
    }

    // Yeni SEO ayarını oluştur
    const newSeoSettings = await (prisma as any).seoSettings.create({
      data: {
        pageUrl: data.pageUrl,
        pageType: data.pageType || "page",
        title: data.title,
        description: data.description,
        keywords: data.keywords || null,
        ogTitle: data.ogTitle || null,
        ogDesc: data.ogDesc || null,
        ogImage: data.ogImage || null,
        canonical: data.canonical || null,
        robots: data.robots || "index, follow",
        schema: data.schema || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return NextResponse.json(newSeoSettings, { status: 201 });
  } catch (error) {
    console.error("SEO ayarı oluşturma hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT - Tüm SEO ayarlarını toplu güncelle (site haritası için)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { seoData } = await req.json();
    
    if (!Array.isArray(seoData) || seoData.length === 0) {
      return NextResponse.json(
        { error: "Geçersiz veri formatı" },
        { status: 400 }
      );
    }

    const updatePromises = seoData.map(async (item) => {
      if (!item.pageUrl) return null;

      const existing = await (prisma as any).seoSettings.findUnique({
        where: { pageUrl: item.pageUrl },
      });

      if (existing) {
        // Mevcut ayarı güncelle
        return (prisma as any).seoSettings.update({
          where: { id: existing.id },
          data: {
            title: item.title || existing.title,
            description: item.description || existing.description,
            keywords: item.keywords || existing.keywords,
            ogTitle: item.ogTitle || existing.ogTitle,
            ogDesc: item.ogDesc || existing.ogDesc,
            ogImage: item.ogImage || existing.ogImage,
            canonical: item.canonical || existing.canonical,
            robots: item.robots || existing.robots,
            schema: item.schema || existing.schema,
            isActive: item.isActive !== undefined ? item.isActive : existing.isActive,
          },
        });
      } else {
        // Yeni ayar oluştur
        return (prisma as any).seoSettings.create({
          data: {
            pageUrl: item.pageUrl,
            pageType: item.pageType || "page",
            title: item.title || `${item.pageUrl.split("/").pop() || "Sayfa"} - Site Adı`,
            description: item.description || `${item.pageUrl.split("/").pop() || "Sayfa"} açıklaması`,
            keywords: item.keywords || null,
            ogTitle: item.ogTitle || null,
            ogDesc: item.ogDesc || null,
            ogImage: item.ogImage || null,
            canonical: item.canonical || null,
            robots: item.robots || "index, follow",
            schema: item.schema || {},
            isActive: item.isActive !== undefined ? item.isActive : true,
          },
        });
      }
    });

    await Promise.all(updatePromises.filter(Boolean));

    return NextResponse.json({ message: "SEO ayarları başarıyla güncellendi" });
  } catch (error) {
    console.error("SEO ayarlarını toplu güncelleme hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarları güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 