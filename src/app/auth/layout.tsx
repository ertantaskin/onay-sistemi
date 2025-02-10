import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex min-h-screen items-center justify-center">
        <div className="w-full flex-1">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
} 