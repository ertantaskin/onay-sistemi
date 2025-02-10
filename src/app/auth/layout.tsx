'use client';

import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useTheme } from '@/app/ThemeContext';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex min-h-[calc(100vh-64px-64px)] items-center justify-center">
        <div className="w-full flex-1">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
} 