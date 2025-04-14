'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function CategoryEditPage({ params }: { params: { id: string } }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    isActive: true,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  });
  const [seoExpanded, setSeoExpanded] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Burada sayfa içeriğine devam ediyor
  return (
    <div className="mb-6">
      <div 
        className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md cursor-pointer mb-2"
        onClick={() => setSeoExpanded(!seoExpanded)}
      >
        <h3 className="text-lg font-medium">SEO Ayarları</h3>
        <button type="button" className="text-gray-600 dark:text-gray-300">
          {seoExpanded ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {seoExpanded && (
        <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="seoTitle">
                SEO Başlığı
              </label>
              <input
                type="text"
                id="seoTitle"
                name="seoTitle"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                placeholder="SEO başlığı"
                value={formData.seoTitle || ''}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">Tarayıcı sekmesinde ve arama sonuçlarında görünen başlık</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="seoKeywords">
                Anahtar Kelimeler
              </label>
              <input
                type="text"
                id="seoKeywords"
                name="seoKeywords"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
                placeholder="anahtar,kelimeler,virgülle,ayırın"
                value={formData.seoKeywords || ''}
                onChange={handleInputChange}
              />
              <p className="text-xs text-gray-500 mt-1">Virgülle ayrılmış anahtar kelimeler</p>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="seoDescription">
              SEO Açıklaması
            </label>
            <textarea
              id="seoDescription"
              name="seoDescription"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800"
              placeholder="Bu kategori hakkında kısa açıklama"
              value={formData.seoDescription || ''}
              onChange={handleInputChange}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Arama sonuçlarında görüntülenen meta açıklaması (150-160 karakter önerilir)</p>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Önizleme:</h4>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md border border-gray-200 dark:border-gray-800">
              <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">
                {formData.seoTitle || formData.name || 'Kategori Başlığı'}
              </p>
              <p className="text-green-600 dark:text-green-400 text-xs">
                {process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/store/category/{formData.slug || 'kategori-slug'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {formData.seoDescription || formData.description || 'Kategori açıklaması burada görünecek...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 