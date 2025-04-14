import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get('path');
    
    if (!path) {
      return NextResponse.json(
        { error: 'Path parametresi gereklidir' },
        { status: 400 }
      );
    }
    
    console.log(`Metadata isteniyor - path: ${path}`);
    
    // Veritabanında sayfayı ara
    try {
      // Prisma client türünü "as any" kullanarak belirtiyoruz
      const seoSettings = await (prisma as any).seoSettings.findUnique({
        where: { 
          pageUrl: path,
          isActive: true 
        }
      });
      
      if (!seoSettings) {
        // Varsayılan metadata
        return NextResponse.json({
          title: 'Microsoft Onay Sistemi',
          description: 'Microsoft ürünleri için online onay sistemi',
          keywords: 'microsoft,onay,lisans,aktivasyon',
          openGraph: {
            title: 'Microsoft Onay Sistemi',
            description: 'Microsoft ürünleri için online onay sistemi',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}${path}`,
            siteName: 'Microsoft Onay Sistemi',
            type: 'website'
          },
          twitter: {
            card: 'summary_large_image',
            title: 'Microsoft Onay Sistemi',
            description: 'Microsoft ürünleri için online onay sistemi'
          },
          robots: 'index, follow'
        });
      }
      
      // SEO verileri bulundu
      return NextResponse.json({
        title: seoSettings.title,
        description: seoSettings.description,
        keywords: seoSettings.keywords || 'microsoft,onay,lisans,aktivasyon',
        openGraph: {
          title: seoSettings.ogTitle || seoSettings.title,
          description: seoSettings.ogDesc || seoSettings.description,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}${path}`,
          siteName: 'Microsoft Onay Sistemi',
          type: seoSettings.pageType === 'product' ? 'product' : 'website',
          ...(seoSettings.ogImage ? { images: [seoSettings.ogImage] } : {})
        },
        twitter: {
          card: 'summary_large_image',
          title: seoSettings.ogTitle || seoSettings.title,
          description: seoSettings.ogDesc || seoSettings.description,
          ...(seoSettings.ogImage ? { images: [seoSettings.ogImage] } : {})
        },
        robots: seoSettings.robots || 'index, follow',
        ...(seoSettings.canonical ? { canonical: seoSettings.canonical } : {}),
        ...(seoSettings.schema && Object.keys(seoSettings.schema).length > 0 
          ? { schema: seoSettings.schema } 
          : {})
      });
    } catch (error) {
      console.error('Metadata DB hatası:', error);
      throw error;
    }
  } catch (error) {
    console.error('Metadata hatası:', error);
    return NextResponse.json(
      { error: 'Metadata alınırken hata oluştu' },
      { status: 500 }
    );
  }
} 