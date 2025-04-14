import { Metadata, ResolvingMetadata } from 'next';
import prisma from '@/lib/prisma';

type Props = {
  params: { id?: string };
  searchParams: { [key: string]: string | string[] | undefined };
  pathname?: string;
};

// Sunucu taraflı meta verileri oluşturur
export async function generateMetadata(
  pathname: string,
  parent?: ResolvingMetadata
): Promise<Metadata> {
  
  console.log("=== METADATA OLUŞTURULUYOR ===");
  console.log("Sayfa yolu:", pathname);
  
  try {
    // Veritabanından SEO ayarını bul
    console.log("Veritabanından SEO verisi aranıyor...");
    
    // Prisma client türünü "as any" kullanarak belirtiyoruz
    const seoData = await (prisma as any).seoSettings.findUnique({
      where: { 
        pageUrl: pathname,
        isActive: true
      }
    });
    
    // Eğer SEO verisi bulunduysa
    if (seoData) {
      console.log("✅ SEO verisi DB'den alındı:", JSON.stringify(seoData, null, 2));
      
      // Temel meta verileri
      const metadata: Metadata = {
        title: seoData.title,
        description: seoData.description,
      };
      
      // Keywords
      if (seoData.keywords) {
        metadata.keywords = seoData.keywords.split(',');
        console.log("Keywords eklendi:", metadata.keywords);
      }
      
      // Open Graph
      metadata.openGraph = {
        title: seoData.ogTitle || seoData.title,
        description: seoData.ogDesc || seoData.description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
        siteName: 'Microsoft Onay Sistemi',
        // @ts-ignore - Type uyumsuzluğunu ignore ediyoruz
        type: seoData.pageType === 'product' ? 'product' : 'website',
      };
      console.log("OpenGraph eklendi");
      
      if (seoData.ogImage && metadata.openGraph) {
        metadata.openGraph.images = [seoData.ogImage];
        console.log("OpenGraph resim eklendi:", seoData.ogImage);
      }
      
      // Twitter
      metadata.twitter = {
        card: 'summary_large_image',
        title: seoData.ogTitle || seoData.title,
        description: seoData.ogDesc || seoData.description,
      };
      console.log("Twitter card eklendi");
      
      if (seoData.ogImage && metadata.twitter) {
        metadata.twitter.images = [seoData.ogImage];
      }
      
      // Robots
      if (seoData.robots) {
        metadata.robots = seoData.robots;
        console.log("Robots direktifi eklendi:", seoData.robots);
      }
      
      // Canonical
      if (seoData.canonical) {
        metadata.alternates = {
          canonical: seoData.canonical,
        };
        console.log("Canonical link eklendi:", seoData.canonical);
      }
      
      // JSON-LD şeması
      if (seoData.schema && Object.keys(seoData.schema).length > 0) {
        // @ts-ignore - Type uyumsuzluğunu ignore ediyoruz
        metadata.other = {
          'script:ld+json': JSON.stringify(seoData.schema),
        };
        console.log("JSON-LD schema eklendi");
      }
      
      console.log("✅ Tüm metadata başarıyla oluşturuldu:", JSON.stringify(metadata, null, 2));
      return metadata;
    } else {
      console.log("⚠️ SEO verisi veritabanında bulunamadı:", pathname);
    }
  } catch (error) {
    console.error("❌ METADATA OLUŞTURMA HATASI:", error);
  }
  
  // Varsayılan metadatayı döndür
  console.log("ℹ️ Varsayılan metadata kullanılıyor");
  return {
    title: 'Microsoft Onay Sistemi',
    description: 'Microsoft ürünleri için online onay sistemi',
    keywords: ['microsoft', 'onay', 'lisans', 'aktivasyon'],
    openGraph: {
      title: 'Microsoft Onay Sistemi',
      description: 'Microsoft ürünleri için online onay sistemi',
      url: `${process.env.NEXT_PUBLIC_SITE_URL}${pathname}`,
      siteName: 'Microsoft Onay Sistemi',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Microsoft Onay Sistemi',
      description: 'Microsoft ürünleri için online onay sistemi',
    },
    robots: 'index, follow',
  };
} 