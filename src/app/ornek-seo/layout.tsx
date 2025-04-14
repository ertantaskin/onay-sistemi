import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Metadata generator
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/ornek-seo');
}

export default function OrnekSeoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 