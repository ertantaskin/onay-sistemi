'use client';

import { useState } from 'react';

export default function TestApiComponent() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSeoSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/seo-settings');
      
      if (!response.ok) {
        throw new Error('SEO ayarları alınamadı');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('SEO ayarları alınırken hata:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createSeoSetting = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Doğrudan veritabanına eklemek için özel bir endpoint çağırıyoruz
      const response = await fetch('/api/debug/create-seo-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageUrl: '/ornek',
          pageType: 'page',
          title: 'Örnek SEO Sayfası | Microsoft Onay Sistemi',
          description: 'Bu sayfa, SEO ayarlarının test edilmesi için oluşturulmuştur. Admin panelinden düzenlenebilir.',
          keywords: 'ornek,test,seo,metadata,deneme',
          isActive: true,
        }),
      });

      if (!response.ok) {
        throw new Error('SEO ayarı oluşturulamadı');
      }
      
      const data = await response.json();
      setResult(data);
      
      // Başarı sonrası sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('SEO ayarı oluşturulurken hata:', error);
      setError(error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">SEO API Test Araçları</h2>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={checkSeoSettings}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Yükleniyor...' : 'SEO Ayarlarını Kontrol Et'}
        </button>
        
        <button
          onClick={createSeoSetting}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300"
        >
          {loading ? 'Yükleniyor...' : 'Örnek Sayfa İçin SEO Oluştur'}
        </button>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-medium">Hata:</p>
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div>
          <h3 className="font-medium mb-2">Sonuç:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md overflow-x-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 