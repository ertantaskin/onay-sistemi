import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Kategoriler ana sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store/categories');
}

export default function CategoriesLayout({
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