'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  Pencil as PencilIcon,
  Trash as TrashIcon, 
  Globe as GlobeAltIcon, 
  Eye as EyeIcon,
  Copy as DocumentDuplicateIcon,
  Loader2, 
  Tag, 
  Package, 
  AlertTriangle,
  Search as MagnifyingGlassIcon,
  RotateCw as ArrowPathIcon,
  Plus as PlusIcon
} from 'lucide-react';

interface SeoSetting {
  id: string;
  pageUrl: string;
  pageType: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SeoSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [seoSettings, setSeoSettings] = useState<SeoSetting[]>([]);
  const [newPages, setNewPages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [syncingCategories, setSyncingCategories] = useState(false);
  const [categorySyncResult, setCategorySyncResult] = useState<{ created: number; updated: number } | null>(null);
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [productSyncResult, setProductSyncResult] = useState<{ created: number; updated: number } | null>(null);

  useEffect(() => {
    fetchSeoSettings();
  }, []);

  const fetchSeoSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/seo-settings');
      
      if (!response.ok) {
        throw new Error('SEO ayarları alınamadı');
      }
      
      const data = await response.json();
      setSeoSettings(data);
    } catch (error) {
      console.error('SEO ayarları alınırken hata oluştu:', error);
      toast.error('SEO ayarları alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const scanForPages = async () => {
    setScanning(true);
    try {
      const response = await fetch('/api/admin/seo-settings/discover');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sayfalar taranamadı');
      }
      
      const data = await response.json();
      setNewPages(data.pages);
      toast.success(`${data.pages.length} yeni sayfa bulundu`);
    } catch (error) {
      console.error('Sayfalar taranırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Sayfalar taranamadı');
    } finally {
      setScanning(false);
    }
  };

  const createSeoForPage = async (pageUrl: string) => {
    try {
      const defaultTitle = pageUrl === '/' 
        ? 'Ana Sayfa - Microsoft Onay Sistemi'
        : `${pageUrl.split('/').pop()?.replace(/-/g, ' ') || 'Sayfa'} - Microsoft Onay Sistemi`;
        
      const response = await fetch('/api/admin/seo-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageUrl,
          pageType: pageUrl.includes('/urun/') ? 'product' : 
                   pageUrl.includes('/kategori/') ? 'category' : 'page',
          title: defaultTitle,
          description: `${pageUrl.split('/').pop()?.replace(/-/g, ' ') || 'Sayfa'} - Microsoft ürünleri için online onay sistemi`,
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('SEO ayarı oluşturulamadı');
      }

      toast.success(`"${pageUrl}" için SEO ayarları oluşturuldu`);
      
      // Yeni sayfaları listeden kaldır ve SEO ayarlarını yenile
      setNewPages(prev => prev.filter(p => p !== pageUrl));
      fetchSeoSettings();
    } catch (error) {
      console.error('SEO ayarı oluşturulurken hata oluştu:', error);
      toast.error('SEO ayarı oluşturulamadı');
    }
  };

  const createAllSeoSettings = async () => {
    if (!newPages.length) {
      toast.error('Keşfedilen sayfa bulunamadı');
      return;
    }

    setLoading(true);
    let successCount = 0;
    
    try {
      for (const pageUrl of newPages) {
        try {
          const defaultTitle = pageUrl === '/' 
            ? 'Ana Sayfa - Microsoft Onay Sistemi'
            : `${pageUrl.split('/').pop()?.replace(/-/g, ' ') || 'Sayfa'} - Microsoft Onay Sistemi`;
            
          const response = await fetch('/api/admin/seo-settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pageUrl,
              pageType: pageUrl.includes('/urun/') ? 'product' : 
                      pageUrl.includes('/kategori/') ? 'category' : 'page',
              title: defaultTitle,
              description: `${pageUrl.split('/').pop()?.replace(/-/g, ' ') || 'Sayfa'} - Microsoft ürünleri için online onay sistemi`,
              isActive: true,
            }),
          });

          if (response.ok) {
            successCount++;
          }
        } catch (error) {
          console.error(`${pageUrl} için SEO ayarı oluşturulurken hata:`, error);
        }
      }
      
      toast.success(`${successCount} sayfa için SEO ayarları oluşturuldu`);
      setNewPages([]);
      fetchSeoSettings();
    } catch (error) {
      console.error('Toplu SEO ayarı oluşturulurken hata:', error);
      toast.error('Bazı SEO ayarları oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  const deleteSeoSetting = async (id: string, pageUrl: string) => {
    if (confirm(`"${pageUrl}" sayfası için SEO ayarlarını silmek istediğinize emin misiniz?`)) {
      try {
        const response = await fetch(`/api/admin/seo-settings/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('SEO ayarı silinemedi');
        }

        toast.success(`"${pageUrl}" için SEO ayarları silindi`);
        fetchSeoSettings();
      } catch (error) {
        console.error('SEO ayarı silinirken hata oluştu:', error);
        toast.error('SEO ayarı silinemedi');
      }
    }
  };

  const updateSeoStatus = async (id: string, isActive: boolean, pageUrl: string) => {
    try {
      const response = await fetch(`/api/admin/seo-settings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('SEO ayarı güncellenemedi');
      }

      toast.success(`"${pageUrl}" için SEO durumu ${isActive ? 'aktif' : 'pasif'} olarak güncellendi`);
      fetchSeoSettings();
    } catch (error) {
      console.error('SEO ayarı güncellenirken hata oluştu:', error);
      toast.error('SEO ayarı güncellenemedi');
    }
  };

  const openPreview = (pageUrl: string) => {
    window.open(`${process.env.NEXT_PUBLIC_SITE_URL}${pageUrl}`, '_blank');
  };

  const filteredSettings = seoSettings.filter((setting) => {
    let matchesFilter = true;
    
    if (filter === 'active') {
      matchesFilter = setting.isActive;
    } else if (filter === 'inactive') {
      matchesFilter = !setting.isActive;
    } else if (filter === 'page') {
      matchesFilter = setting.pageType === 'page';
    } else if (filter === 'product') {
      matchesFilter = setting.pageType === 'product';
    } else if (filter === 'category') {
      matchesFilter = setting.pageType === 'category';
    }
    
    return matchesFilter && 
      (searchTerm === '' || 
       setting.pageUrl.toLowerCase().includes(searchTerm.toLowerCase()) || 
       setting.title.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const handleCategorySeoSync = async () => {
    setSyncingCategories(true);
    try {
      const response = await fetch('/api/admin/seo-settings/sync-categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Kategori SEO senkronizasyon hatası:', errorData);
        throw new Error(errorData.error || 'Kategori SEO senkronizasyonu alınamadı');
      }
      
      const data = await response.json();
      setCategorySyncResult(data.results || { created: 0, updated: 0 });
      toast.success(`Kategori SEO senkronizasyonu tamamlandı: ${data.results?.created || 0} oluşturuldu, ${data.results?.updated || 0} güncellendi`);
    } catch (error) {
      console.error('Kategori SEO senkronizasyonu alınırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Kategori SEO senkronizasyonu alınamadı');
    } finally {
      setSyncingCategories(false);
    }
  };

  const handleProductSeoSync = async () => {
    setSyncingProducts(true);
    try {
      const response = await fetch('/api/admin/seo-settings/sync-products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ürün SEO senkronizasyon hatası:', errorData);
        throw new Error(errorData.error || 'Ürün SEO senkronizasyonu alınamadı');
      }
      
      const data = await response.json();
      setProductSyncResult(data.results || { created: 0, updated: 0 });
      toast.success(`Ürün SEO senkronizasyonu tamamlandı: ${data.results?.created || 0} oluşturuldu, ${data.results?.updated || 0} güncellendi`);
    } catch (error) {
      console.error('Ürün SEO senkronizasyonu alınırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Ürün SEO senkronizasyonu alınamadı');
    } finally {
      setSyncingProducts(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">SEO Ayarları Yönetimi</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => window.open('/api/sitemap', '_blank')}
            className="flex items-center bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Sitemap
          </button>
          
          <button
            onClick={scanForPages}
            disabled={scanning}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
          >
            {scanning ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                <span>Taranıyor...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                <span>Sayfaları Tara</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keşfedilen sayfalar bölümü */}
      {newPages.length > 0 && (
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Keşfedilen Sayfalar ({newPages.length})</h2>
            <button
              onClick={createAllSeoSettings}
              disabled={loading}
              className="inline-flex items-center px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="mr-1 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                <>
                  <PlusIcon className="mr-1 h-4 w-4" />
                  Tümünü Oluştur
                </>
              )}
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Aşağıdaki sayfalar sitenizde mevcut, ancak henüz SEO ayarları tanımlanmamış. Her biri için ayarları otomatik oluşturabilirsiniz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {newPages.map((page) => (
              <div key={page} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700">
                <span className="font-medium">{page}</span>
                <button
                  onClick={() => createSeoForPage(page)}
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtreleme ve arama */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Sayfa URL'si veya başlık ara..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex space-x-2">
          <select
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tüm Sayfalar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="page">Sayfalar</option>
            <option value="product">Ürünler</option>
            <option value="category">Kategoriler</option>
          </select>
          
          <button
            onClick={fetchSeoSettings}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Yenile
          </button>
        </div>
      </div>

      {/* Toplu SEO İşlemleri Bölümü */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-xl font-medium mb-4">Toplu SEO İşlemleri</h2>
        <div className="flex flex-wrap gap-4">
          <div className="w-full md:w-auto">
            <button
              onClick={handleCategorySeoSync}
              disabled={syncingCategories}
              className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-400 flex items-center justify-center"
            >
              {syncingCategories ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Kategoriler Senkronize Ediliyor...
                </>
              ) : (
                <>
                  <Tag className="h-4 w-4 mr-2" />
                  Kategorileri Senkronize Et
                </>
              )}
            </button>
            {categorySyncResult && (
              <div className="mt-2 text-sm">
                <p className="text-green-600 dark:text-green-400">
                  ✅ Kategori SEO senkronizasyonu tamamlandı: {categorySyncResult.created} oluşturuldu, {categorySyncResult.updated} güncellendi
                </p>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-auto">
            <button
              onClick={handleProductSeoSync}
              disabled={syncingProducts}
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center"
            >
              {syncingProducts ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Ürünler Senkronize Ediliyor...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  Ürünleri Senkronize Et
                </>
              )}
            </button>
            {productSyncResult && (
              <div className="mt-2 text-sm">
                <p className="text-green-600 dark:text-green-400">
                  ✅ Ürün SEO senkronizasyonu tamamlandı: {productSyncResult.created} oluşturuldu, {productSyncResult.updated} güncellendi
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="inline-block h-4 w-4 mr-1" /> 
            Bu işlem, tüm kategori ve ürünler için otomatik SEO kayıtları oluşturur veya günceller. 
            Manuel olarak yapılan SEO düzenlemeleriniz korunacak, sadece eksik kayıtlar oluşturulacaktır.
          </p>
        </div>
      </div>

      {/* SEO Ayarları Listesi */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Sayfa URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Başlık
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Tür
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSettings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Gösterilecek SEO ayarı bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredSettings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {setting.pageUrl}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 truncate max-w-xs">
                      {setting.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${setting.pageType === 'page' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                          setting.pageType === 'product' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}>
                        {setting.pageType === 'page' ? 'Sayfa' : 
                         setting.pageType === 'product' ? 'Ürün' : 'Kategori'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <button
                        onClick={() => updateSeoStatus(setting.id, !setting.isActive, setting.pageUrl)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${setting.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                           'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}
                      >
                        {setting.isActive ? 'Aktif' : 'Pasif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => openPreview(setting.pageUrl)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Sayfayı Önizle"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/seo-settings/${setting.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Düzenle"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => deleteSeoSetting(setting.id, setting.pageUrl)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Sil"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 