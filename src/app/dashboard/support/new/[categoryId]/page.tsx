'use client';

import { Suspense, use } from 'react';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import TicketForm from './TicketForm';

export default function NewTicketPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const resolvedParams = use(params);
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <Toaster position="top-center" />
      
      <Suspense fallback={
        <div className="pt-24 pb-16 flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Sayfa yükleniyor...</p>
          </div>
        </div>
      }>
        <TicketForm categoryId={resolvedParams.categoryId} />
      </Suspense>
      
      <Footer />
    </div>
  );
} 