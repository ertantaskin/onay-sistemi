import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Siparişler sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/orders');
}

export default function OrdersLayout({
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