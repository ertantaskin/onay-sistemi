import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Krediler sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/credits');
}

export default function CreditsLayout({
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