import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST - Yeni SEO test ayarı oluştur (Debug amaçlı, yetkilendirme olmadan)
export async function POST(req: NextRequest) {
  try {
    console.log("[TEST-API] SEO test ayarı oluşturma isteği alındı");
    
    const data = await req.json();
    console.log("[TEST-API] Alınan veri:", data);
    
    // Gerekli alanları kontrol et
    if (!data.pageUrl || !data.title || !data.description) {
      return NextResponse.json(
        { error: "Sayfa URL'si, başlık ve açıklama zorunludur" },
        { status: 400 }
      );
    }

    // URL'nin benzersiz olduğunu kontrol et
    // @ts-ignore - Prisma client SeoSettings modelini TypeScript'te tanımıyor
    const existingSeo = await prisma.seoSettings.findUnique({
      where: { pageUrl: data.pageUrl },
    });

    // Eğer varsa, güncelle
    if (existingSeo) {
      console.log("[TEST-API] Mevcut kayıt güncelleniyor:", existingSeo.id);
      
      // @ts-ignore - Prisma client SeoSettings modelini TypeScript'te tanımıyor
      const updatedSeo = await prisma.seoSettings.update({
        where: { id: existingSeo.id },
        data: {
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
      
      console.log("[TEST-API] Kayıt güncellendi:", updatedSeo.id);
      return NextResponse.json(updatedSeo);
    }

    // Yeni SEO ayarını oluştur
    console.log("[TEST-API] Yeni kayıt oluşturuluyor");
    // @ts-ignore - Prisma client SeoSettings modelini TypeScript'te tanımıyor
    const newSeoSettings = await prisma.seoSettings.create({
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

    console.log("[TEST-API] Yeni SEO kaydı oluşturuldu:", newSeoSettings.id);
    return NextResponse.json(newSeoSettings, { status: 201 });
  } catch (error) {
    console.error("[TEST-API] SEO ayarı oluşturma hatası:", error);
    return NextResponse.json(
      { error: "SEO ayarı oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
} 