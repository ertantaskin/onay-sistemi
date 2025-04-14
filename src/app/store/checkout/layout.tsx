import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Ödeme sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store/checkout');
}

export default function CheckoutLayout({
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