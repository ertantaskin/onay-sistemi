import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Sipariş tamamlama sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/store/order-complete');
}

export default function OrderCompleteLayout({
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