import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Metadata üreteci - sayfaya özel pathname ile
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/ornek');
}

export default function OrnekLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 