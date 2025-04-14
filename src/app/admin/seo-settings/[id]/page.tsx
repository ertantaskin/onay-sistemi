'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SeoSetting {
  id: string;
  pageUrl: string;
  pageType: string;
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDesc?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  schema?: any;
  isActive: boolean;
}

export default function EditSeoSettingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seoSetting, setSeoSetting] = useState<SeoSetting | null>(null);

  useEffect(() => {
    if (id) {
      fetchSeoSetting();
    }
  }, [id]);

  const fetchSeoSetting = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/seo-settings/${id}`);
      
      if (!response.ok) {
        throw new Error('SEO ayarı alınamadı');
      }
      
      const data = await response.json();
      setSeoSetting(data);
    } catch (error) {
      console.error('SEO ayarı alınırken hata oluştu:', error);
      toast.error('SEO ayarı alınamadı');
      router.push('/admin/seo-settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!seoSetting) return;
    
    const { name, value } = e.target;
    setSeoSetting({
      ...seoSetting,
      [name]: value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!seoSetting) return;
    
    const { name, checked } = e.target;
    setSeoSetting({
      ...seoSetting,
      [name]: checked,
    });
  };

  const handleSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!seoSetting) return;
    
    try {
      const schemaValue = e.target.value.trim() ? JSON.parse(e.target.value) : {};
      setSeoSetting({
        ...seoSetting,
        schema: schemaValue,
      });
    } catch (error) {
      // JSON hatalı, ama kullanıcının düzenlemeye devam etmesine izin ver
      setSeoSetting({
        ...seoSetting,
        schema: e.target.value, // Düz metin olarak sakla
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seoSetting) return;
    
    try {
      setSaving(true);
      
      let submitData = { ...seoSetting };
      
      // Eğer schema bir string ise, JSON'a çevirmeye çalış
      if (typeof submitData.schema === 'string') {
        try {
          submitData.schema = JSON.parse(submitData.schema as string);
        } catch (error) {
          toast.error('Schema JSON formatı geçersiz');
          return;
        }
      }
      
      const response = await fetch(`/api/admin/seo-settings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('SEO ayarı güncellenemedi');
      }

      toast.success('SEO ayarları başarıyla güncellendi');
      router.push('/admin/seo-settings');
    } catch (error) {
      console.error('SEO ayarı güncellenirken hata oluştu:', error);
      toast.error('SEO ayarı güncellenemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!seoSetting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-red-500 mb-4">SEO ayarı bulunamadı.</p>
        <button
          onClick={() => router.push('/admin/seo-settings')}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          SEO Ayarları Listesine Dön
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/admin/seo-settings')}
            className="mr-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 p-2 rounded-full"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold">SEO Ayarı Düzenle</h1>
        </div>
        
        <button
          onClick={() => window.open(`${process.env.NEXT_PUBLIC_SITE_URL}${seoSetting.pageUrl}`, '_blank')}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
        >
          Sayfayı Önizle
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sayfa URL
              </label>
              <input
                type="text"
                name="pageUrl"
                value={seoSetting.pageUrl}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sayfa Türü
              </label>
              <select
                name="pageType"
                value={seoSetting.pageType}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="page">Sayfa</option>
                <option value="product">Ürün</option>
                <option value="category">Kategori</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Başlık
            </label>
            <input
              type="text"
              name="title"
              value={seoSetting.title}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Tarayıcı sekmesinde ve arama sonuçlarında görünen başlık. 60 karakterden az olmalıdır.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={seoSetting.description}
              onChange={handleChange}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              Arama sonuçlarında görünen kısa açıklama. 160 karakterden az olmalıdır.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Anahtar Kelimeler
            </label>
            <input
              type="text"
              name="keywords"
              value={seoSetting.keywords || ''}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500">
              Virgülle ayrılmış anahtar kelimeler (örn: microsoft,onay,lisans)
            </p>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Open Graph (Sosyal Medya Paylaşım) Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OG Başlık
                </label>
                <input
                  type="text"
                  name="ogTitle"
                  value={seoSetting.ogTitle || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sosyal medyada paylaşıldığında görünecek başlık (boş bırakılırsa normal başlık kullanılır)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  OG Açıklama
                </label>
                <input
                  type="text"
                  name="ogDesc"
                  value={seoSetting.ogDesc || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sosyal medyada paylaşıldığında görünecek açıklama
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                OG Resim URL
              </label>
              <input
                type="text"
                name="ogImage"
                value={seoSetting.ogImage || ''}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500">
                Sosyal medyada paylaşıldığında görünecek resmin URL'si
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4">Gelişmiş SEO Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Canonical URL
                </label>
                <input
                  type="text"
                  name="canonical"
                  value={seoSetting.canonical || ''}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Sayfanın kanonik URL'si (çoğu durumda boş bırakılabilir)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Robots Direktifi
                </label>
                <input
                  type="text"
                  name="robots"
                  value={seoSetting.robots || 'index, follow'}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Arama motorları için yönergeler (örn: index, follow)
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Schema.org JSON-LD
              </label>
              <textarea
                name="schema"
                value={typeof seoSetting.schema === 'object' 
                  ? JSON.stringify(seoSetting.schema, null, 2) 
                  : seoSetting.schema || '{}'}
                onChange={handleSchemaChange}
                rows={8}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              ></textarea>
              <p className="mt-1 text-sm text-gray-500">
                Schema.org yapılandırılmış veri JSON formatında (isteğe bağlı)
              </p>
            </div>
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={seoSetting.isActive}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              SEO ayarları aktif
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/seo-settings')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {saving ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 