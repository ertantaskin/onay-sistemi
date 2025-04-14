import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Kredi ekleme sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/credits/add');
}

export default function CreditsAddLayout({
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