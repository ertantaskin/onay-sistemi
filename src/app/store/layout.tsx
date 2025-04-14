import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store');
}

export default function StoreLayout({
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