import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Onaylar sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/approvals');
}

export default function ApprovalsLayout({
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