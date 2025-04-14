import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';
import prisma from '@/lib/prisma';

// Kategori detay sayfası için dinamik metadata üreteci
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    console.log(`[KategoriLayout] 📋 '/kategori/${params.slug}' için metadata oluşturuluyor...`);
    
    // 1. Önce doğrudan /kategori/[slug] yolu için SEO kaydı kontrolü
    const directPath = `/kategori/${params.slug}`;
    const directMetadata = await getPageMetadata(directPath);
    
    if (directMetadata.title !== 'Microsoft Onay Sistemi') {
      console.log(`[KategoriLayout] ✅ Doğrudan /kategori yolu için SEO kaydı bulundu: ${directMetadata.title}`);
      return directMetadata;
    }
    
    // 2. Alternatif olarak /store/category/[slug] için SEO kaydı kontrolü
    const storePath = `/store/category/${params.slug}`;
    const storeMetadata = await getPageMetadata(storePath);
    
    if (storeMetadata.title !== 'Microsoft Onay Sistemi') {
      console.log(`[KategoriLayout] ✅ Store category yolu için SEO kaydı bulundu: ${storeMetadata.title}`);
      return storeMetadata;
    }
    
    // 3. SEO kaydı yoksa kategori bilgilerinden metadata oluştur
    console.log(`[KategoriLayout] 🔍 SEO kaydı bulunamadı, kategori veri tabanından aranıyor: ${params.slug}`);
    
    // @ts-ignore
    const category = await prisma.productCategory.findFirst({
      where: {
        OR: [
          { slug: params.slug },
          { id: params.slug }
        ]
      }
    });
    
    if (category) {
      console.log(`[KategoriLayout] ✅ Kategori veritabanında bulundu: ${category.name}`);
      
      const dynamicMetadata: Metadata = {
        title: `${category.name} - Microsoft Lisans Mağazası`,
        description: category.description || `Microsoft ${category.name} lisansları ve ürünleri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.`,
        openGraph: {
          title: `${category.name} - Microsoft Lisans Mağazası`,
          description: category.description || `Microsoft ${category.name} lisansları ve ürünleri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.`,
          type: 'website',
        },
        keywords: [`microsoft`, `lisans`, `${category.name.toLowerCase()}`, `kategori`, `onay sistemi`]
      };
      
      return dynamicMetadata;
    }
    
    // 4. Hiçbir şekilde kategori bulunamadıysa varsayılan metadata kullan
    console.log(`[KategoriLayout] ⚠️ Kategori bulunamadı, varsayılan metadata kullanılıyor`);
    return {
      title: "Kategori - Microsoft Lisans Mağazası",
      description: "Microsoft ürün kategorileri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.",
      keywords: ["microsoft", "lisans", "kategori", "onay sistemi"]
    };
  } catch (error) {
    console.error(`[KategoriLayout] ❌ Metadata oluşturma hatası:`, error);
    
    // Hata durumunda varsayılan metadata döndür
    return {
      title: "Kategori - Microsoft Lisans Mağazası",
      description: "Microsoft ürün kategorileri - Microsoft Onay Sistemi'nde uygun fiyatlarla satın alın.",
      keywords: ["microsoft", "lisans", "kategori", "onay sistemi"]
    };
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