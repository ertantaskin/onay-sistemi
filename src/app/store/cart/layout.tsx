import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Sepet sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store/cart');
}

export default function CartLayout({
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