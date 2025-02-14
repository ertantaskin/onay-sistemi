'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiOutlineChatAlt2, HiOutlineArrowLeft } from 'react-icons/hi';
import SupportHeader from '@/components/support/SupportHeader';

interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
}

export default function NewTicketCategoryPage() {
  const [categories, setCategories] = useState<SupportCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>
      </div>

      <SupportHeader 
        title="Destek Kategorisi Seçin"
        description="Size en iyi şekilde yardımcı olabilmemiz için lütfen bir kategori seçin"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 text-left border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 group"
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                <HiOutlineChatAlt2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">Henüz aktif destek kategorisi bulunmuyor.</p>
        </div>
      )}
    </div>
  );
} 