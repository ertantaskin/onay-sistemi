import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Kategoriler sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store/category');
}

export default function CategoryIndexLayout({
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