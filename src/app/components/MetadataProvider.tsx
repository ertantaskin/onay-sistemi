import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import { cache } from 'react';

// SEO verilerini önbelleğe alan fonksiyon
const getSeoData = cache(async (pathname: string) => {
  console.log(`[MetadataProvider] 🔍 ${pathname} için veritabanında SEO verisi aranıyor...`);
  
  try {
    // @ts-ignore - Prisma client'ın SeoSettings modelini tanımaması sorunu
    const seoData = await prisma.seoSettings.findUnique({
      where: { 
        pageUrl: pathname,
        isActive: true
      }
    });
    
    if (seoData) {
      console.log(`[MetadataProvider] ✅ ${pathname} için SEO verisi bulundu (${seoData.id})`);
    } else {
      console.log(`[MetadataProvider] ⚠️ ${pathname} için SEO verisi bulunamadı`);
      
      // Ürün veya kategori olabileceğini kontrol et
      if (pathname.includes('/store/category/') || pathname.includes('/store/categories/')) {
        const slug = pathname.split('/').pop();
        console.log(`[MetadataProvider] 🔄 Kategori slug'ı algılandı: ${slug}`);
        
        try {
          // @ts-ignore - Prisma client kategori modelini tanımıyor
          const category = await prisma.productCategory.findFirst({
            where: { 
              OR: [
                { slug: slug },
                { id: slug }
              ]
            }
          });
          
          if (category) {
            console.log(`[MetadataProvider] 🏷️ Kategori veritabanında bulundu: ${category.name}`);
          }
        } catch (error) {
          console.error(`[MetadataProvider] ❌ Kategori veritabanı sorgusu hatası:`, error);
        }
      } else if (pathname.includes('/store/product/')) {
        const productSlug = pathname.split('/').pop();
        console.log(`[MetadataProvider] 🔄 Ürün slug'ı algılandı: ${productSlug}`);
      }
    }
    
    return seoData;
  } catch (error) {
    console.error(`[MetadataProvider] ❌ Veritabanı hatası: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
});

/**
 * Bu fonksiyon, verilen sayfa yoluna göre veritabanından 
 * SEO meta verilerini alıp döndürür. React.cache ile performans artırılmıştır.
 */
export async function getPageMetadata(pathname: string): Promise<Metadata> {
  console.log(`[MetadataProvider] 🚀 ${pathname} için meta veriler alınıyor...`);
  
  try {
    // Önbelleğe alınmış veriyi getir
    const seoData = await getSeoData(pathname);

    if (seoData) {
      const metadata: Metadata = {
        title: seoData.title,
        description: seoData.description,
      };
      
      // Keywords
      if (seoData.keywords) {
        metadata.keywords = seoData.keywords.split(',');
      }
      
      // Open Graph
      metadata.openGraph = {
        title: seoData.ogTitle || seoData.title,
        description: seoData.ogDesc || seoData.description,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}${pathname}`,
        siteName: 'Microsoft Onay Sistemi',
        // @ts-ignore - Type uyumsuzluğu için ignore ediyoruz
        type: seoData.pageType === 'product' ? 'product' : 'website',
      };
      
      if (seoData.ogImage && metadata.openGraph) {
        metadata.openGraph.images = [seoData.ogImage];
      }
      
      // Twitter
      metadata.twitter = {
        card: 'summary_large_image',
        title: seoData.ogTitle || seoData.title,
        description: seoData.ogDesc || seoData.description,
      };
      
      if (seoData.ogImage && metadata.twitter) {
        metadata.twitter.images = [seoData.ogImage];
      }
      
      // Robots
      if (seoData.robots) {
        metadata.robots = seoData.robots;
      }
      
      // Canonical
      if (seoData.canonical) {
        metadata.alternates = {
          canonical: seoData.canonical,
        };
      }
      
      // JSON-LD şeması
      if (seoData.schema && Object.keys(JSON.parse(typeof seoData.schema === 'string' ? seoData.schema : JSON.stringify(seoData.schema))).length > 0) {
        metadata.other = {
          // @ts-ignore
          'script:ld+json': typeof seoData.schema === 'string' ? seoData.schema : JSON.stringify(seoData.schema),
        };
      }
      
      console.log(`[MetadataProvider] ✨ Metadata oluşturuldu: ${metadata.title}`);
      return metadata;
    }
  } catch (error) {
    console.error(`[MetadataProvider] ❌ Metadata alınırken hata: ${error instanceof Error ? error.message : String(error)}`);
  }
  
  // Varsayılan değerler
  console.log(`[MetadataProvider] ℹ️ Varsayılan metadata kullanılıyor: ${pathname}`);
  return {
    title: 'Microsoft Onay Sistemi',
    description: 'Microsoft ürünleri için online onay sistemi',
    keywords: ['microsoft', 'onay', 'lisans', 'aktivasyon'],
    openGraph: {
      title: 'Microsoft Onay Sistemi',
      description: 'Microsoft ürünleri için online onay sistemi',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}${pathname}`,
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