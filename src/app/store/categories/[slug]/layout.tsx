import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Kategori sayfası için dinamik metadata üreteci
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Kategori slug'ını alıp URL yolu oluştur
  const categoryPath = `/store/categories/${params.slug}`;
  
  // Öncelikle özel kategori URL'si için kontrol et
  const metadata = await getPageMetadata(categoryPath);
  
  // Eğer özel kategori metadatası yoksa genel kategori sayfası metadatasını kullan
  if (metadata.title === 'Microsoft Onay Sistemi') {
    return getPageMetadata('/store/categories');
  }
  
  return metadata;
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