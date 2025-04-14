import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Destek sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/support');
}

export default function SupportLayout({
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