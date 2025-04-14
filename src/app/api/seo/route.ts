import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    
    if (!path) {
      return NextResponse.json(
        { error: "Path parametresi gereklidir" },
        { status: 400 }
      );
    }

    console.log(`SEO verileri isteniyor - path: ${path}`);

    // Veritabanında sayfayı ara
    try {
      // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
      const seoSettings = await prisma.seoSettings.findUnique({
        where: { 
          pageUrl: path, 
          isActive: true 
        },
      });

      console.log(`SEO ayarları bulundu mu: ${!!seoSettings}`, seoSettings);

      if (!seoSettings) {
        // Sayfa bulunamazsa varsayılan SEO bilgilerini döndür
        const defaultSeo = {
          title: "Microsoft Onay Sistemi",
          description: "Microsoft ürünleri için online onay sistemi",
          keywords: "microsoft,lisans,onay,aktivasyon",
          robots: "index, follow",
        };
        console.log("Varsayılan SEO ayarları kullanılıyor:", defaultSeo);
        return NextResponse.json(defaultSeo);
      }

      const seoData = {
        title: seoSettings.title,
        description: seoSettings.description,
        keywords: seoSettings.keywords || "",
        ogTitle: seoSettings.ogTitle || "",
        ogDesc: seoSettings.ogDesc || "",
        ogImage: seoSettings.ogImage || "",
        canonical: seoSettings.canonical || "",
        robots: seoSettings.robots || "index, follow",
        schema: seoSettings.schema || {},
      };
      
      console.log("Döndürülen SEO verileri:", seoData);
      return NextResponse.json(seoData);
    } catch (dbError) {
      console.error("SEO veritabanı hatası:", dbError);
      // Hata durumunda varsayılan döndür
      return NextResponse.json({
        title: "Microsoft Onay Sistemi",
        description: "Microsoft ürünleri için online onay sistemi",
        keywords: "microsoft,lisans,onay,aktivasyon",
        robots: "index, follow",
      });
    }
  } catch (error) {
    console.error("SEO veri getirme hatası:", error);
    return NextResponse.json(
      { error: "SEO verileri getirilirken bir hata oluştu" },
      { status: 500 }
    );
  }
} 