import { Metadata } from 'next';
import prisma from '@/lib/prisma';

export async function getSeoMetadata(path: string): Promise<Metadata> {
  try {
    // Veritabanında sayfa verilerini ara
    const seoSettings = await (prisma as any).seoSettings.findUnique({
      where: { 
        pageUrl: path,
        isActive: true
      },
    });

    if (!seoSettings) {
      // Sayfa bulunamazsa varsayılan SEO bilgilerini döndür
      return {
        title: "Microsoft Onay Sistemi",
        description: "Microsoft ürünleri için online onay sistemi",
        keywords: ["microsoft", "lisans", "onay", "aktivasyon"],
        openGraph: {
          title: "Microsoft Onay Sistemi",
          description: "Microsoft ürünleri için online onay sistemi",
          type: "website",
          url: `${process.env.NEXT_PUBLIC_SITE_URL}${path}`,
        },
        robots: "index, follow",
      };
    }

    // SEO ayarlarından metadata değerlerini oluştur
    const metadata: Metadata = {
      title: seoSettings.title,
      description: seoSettings.description,
      keywords: seoSettings.keywords ? seoSettings.keywords.split(',') : [],
    };

    // Open Graph
    if (seoSettings.ogTitle || seoSettings.ogDesc || seoSettings.ogImage) {
      metadata.openGraph = {
        title: seoSettings.ogTitle || seoSettings.title,
        description: seoSettings.ogDesc || seoSettings.description,
        // @ts-ignore - OpenGraph tipini desteklemek için
        type: seoSettings.pageType === 'product' ? 'product' : 'website',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${path}`,
      };

      if (seoSettings.ogImage && metadata.openGraph) {
        metadata.openGraph.images = [seoSettings.ogImage];
      }
    }

    // Canonical URL
    if (seoSettings.canonical) {
      metadata.alternates = {
        canonical: seoSettings.canonical,
      };
    }

    // Robots
    if (seoSettings.robots) {
      metadata.robots = seoSettings.robots;
    }

    // JSON-LD Şeması
    if (seoSettings.schema && Object.keys(seoSettings.schema).length > 0) {
      metadata.other = {
        'script:ld+json': JSON.stringify(seoSettings.schema),
      };
    }

    return metadata;
  } catch (error) {
    console.error("Meta veri getirme hatası:", error);
    
    // Hata durumunda varsayılan metadata
    return {
      title: "Microsoft Onay Sistemi",
      description: "Microsoft ürünleri için online onay sistemi",
    };
  }
} 