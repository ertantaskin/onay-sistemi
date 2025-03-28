'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import { MessageSquareText, ArrowLeft, HelpCircle } from "lucide-react";

interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
}

export default function NewTicketCategoryPage() {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadCategories();
  }, [session, sessionStatus]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/support/categories');
      if (!response.ok) throw new Error('Kategoriler yüklenemedi');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error('Kategoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    router.push(`/dashboard/support/new/${categoryId}`);
  };

  if (loading && sessionStatus !== 'loading') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Destek kategorileri yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <Toaster position="top-center" />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Sayfa Başlığı */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <MessageSquareText className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Yeni Destek Talebi</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Size en iyi şekilde yardımcı olabilmemiz için lütfen bir kategori seçin
              </p>
            </div>
          </div>
        </div>

        {/* Geri Dön Butonu */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Geri Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Destek Kategorileri */}
          <div className="lg:col-span-9">
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6 mb-6`}>
              <div className="flex items-center space-x-3 mb-4">
                <HelpCircle className="h-6 w-6 text-blue-500" />
                <h2 className="text-xl font-semibold">Destek Kategorisi Seçin</h2>
              </div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                Aşağıdaki kategorilerden birisini seçerek bir destek talebi oluşturabilirsiniz. Sorunuza en uygun kategoriyi seçmeniz hızlı çözüm sağlamamıza yardımcı olacaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-6 rounded-xl ${
                    theme === 'dark' 
                      ? 'bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500'
                      : 'bg-white hover:bg-gray-50 border border-gray-100 hover:border-blue-200'
                  } shadow-md hover:shadow-lg transition-all duration-300 text-left group`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/20 group-hover:bg-blue-900/40' : 'bg-blue-50 group-hover:bg-blue-100'
                    } transition-colors`}>
                      <MessageSquareText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors`}>
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {categories.length === 0 && (
              <div className={`text-center py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
                <HelpCircle className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Henüz aktif destek kategorisi bulunmuyor</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Lütfen daha sonra tekrar deneyiniz.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 