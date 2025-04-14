import { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getPageMetadata } from '@/app/components/MetadataProvider';

// Dashboard için metadata üreteci
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/dashboard');
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-24 min-h-screen bg-gray-50 dark:bg-gray-900">{children}</main>
      <Footer />
    </>
  );
} 