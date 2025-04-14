import { Metadata } from 'next';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Profil sayfası için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard/profile');
}

export default function ProfileLayout({
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