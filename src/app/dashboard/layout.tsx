import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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