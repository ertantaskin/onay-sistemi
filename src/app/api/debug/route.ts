import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Debug bilgilerini döndür
export async function GET(req: NextRequest) {
  try {
    // Tüm SEO ayarlarını al
    // @ts-ignore - Prisma client SeoSettings modelini TypeScript'te tanımıyor
    const seoSettings = await prisma.seoSettings.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    // URL parametreleri
    const url = new URL(req.url);
    const pageUrl = url.searchParams.get('page');
    
    // Belirli bir sayfa için SEO ayarını al
    let pageSeo = null;
    if (pageUrl) {
      // @ts-ignore - Prisma client SeoSettings modelini TypeScript'te tanımıyor
      pageSeo = await prisma.seoSettings.findUnique({
        where: { pageUrl }
      });
    }
    
    return NextResponse.json({
      totalSeoSettings: seoSettings.length,
      seoSettings: seoSettings.slice(0, 10).map(s => ({
        id: s.id,
        pageUrl: s.pageUrl,
        title: s.title,
        isActive: s.isActive
      })),
      requestedPage: pageUrl,
      pageSeo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Debug API hatası:", error);
    return NextResponse.json(
      { error: "API hatası", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 