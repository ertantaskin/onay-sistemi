import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';
import prisma from '@/lib/prisma';

// Kategori detay sayfası için dinamik metadata üreteci
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    console.log(`[CategoryLayout] 📋 '${params.slug}' slug'ı için metadata oluşturuluyor...`);
    
    // 1. Önce SEO ayarlarında tam URL için kayıt var mı kontrol et
    const pathname = `/store/category/${params.slug}`;
    const metadataFromSeo = await getPageMetadata(pathname);
    
    // Eğer SEO ayarlarında bu URL için özel bir metadata varsa (varsayılan title'dan farklıysa) onu kullan
    if (metadataFromSeo.title !== 'Microsoft Onay Sistemi') {
      console.log(`[CategoryLayout] 🔄 SEO ayarlarından metadata kullanılıyor: ${metadataFromSeo.title}`);
      return metadataFromSeo;
    }
    
    // 2. SEO ayarlarında yoksa, kategori bilgilerinden dinamik metadata oluştur
    console.log(`[CategoryLayout] 🏷️ Kategori bilgilerinden metadata oluşturuluyor: ${params.slug}`);
    
    // @ts-ignore - Prisma client'ın category modelini TypeScript'te tanımıyor
    const category = await prisma.productCategory.findFirst({
      where: { 
        OR: [
          { slug: params.slug },
          { id: params.slug }
        ]
      }
    });
    
    if (category) {
      console.log(`[CategoryLayout] ✅ Kategori bulundu: ${category.name}`);
      
      // Kategori bilgilerinden metadata oluştur
      const dynamicMetadata: Metadata = {
        title: `${category.name} - Microsoft Lisans Mağazası`,
        description: category.description || `Microsoft ${category.name} lisansları ve ürünleri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.`,
        openGraph: {
          title: `${category.name} - Microsoft Lisans Mağazası`,
          description: category.description || `Microsoft ${category.name} lisansları ve ürünleri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.`,
          type: 'website',
        }
      };
      
      return dynamicMetadata;
    } else {
      console.log(`[CategoryLayout] ⚠️ Kategori bulunamadı: ${params.slug}`);
    }
    
    // 3. Varsayılan kategori sayfası metadata'sını kullan
    console.log(`[CategoryLayout] ℹ️ Varsayılan kategori metadata'sı kullanılıyor`);
    return getPageMetadata('/store/category');
  } catch (error) {
    console.error(`[CategoryLayout] ❌ Metadata alınamadı:`, error);
    
    // Hata durumunda varsayılan kategori metadata'sını kullan
    return getPageMetadata('/store/category');
  }
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
    </div>
  );
} 