'use client';

import { useEffect } from "react";
import PageContent from "@/components/PageContent";
import { usePageContent } from "@/hooks/usePageContent";

export default function OrnekSayfa() {
  const { pageContent, isLoading } = usePageContent("ornek-sayfa");

  // Sayfa başlığı ve açıklaması için varsayılan değerler
  const pageTitle = pageContent?.metaTitle || "Örnek Sayfa";
  const pageDescription = pageContent?.metaDesc || "Sayfa içeriği kullanımı için örnek sayfa";

  // useEffect ile meta etiketlerini güncelleyelim
  useEffect(() => {
    // Sayfa başlığını güncelle
    document.title = pageTitle;
    
    // Meta açıklamasını güncelle
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Open Graph meta etiketlerini güncelle
    const updateOgMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMetaTag('description', pageDescription);
    updateOgMetaTag('og:title', pageTitle);
    updateOgMetaTag('og:description', pageDescription);
    updateOgMetaTag('twitter:title', pageTitle);
    updateOgMetaTag('twitter:description', pageDescription);
  }, [pageTitle, pageDescription]);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageContent 
        pageKey="ornek-sayfa" 
        fallback={
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Örnek Sayfa</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              Bu sayfa için henüz içerik oluşturulmamış. Admin panelinden içerik ekleyebilirsiniz.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-3">İçerik Nasıl Eklenir?</h2>
              <ol className="list-decimal list-inside space-y-2 text-left">
                <li>Admin paneline giriş yapın</li>
                <li>Ayarlar &gt; Sayfa İçerikleri menüsüne gidin</li>
                <li>Yeni Sayfa İçeriği Oluştur bölümünden yeni içerik ekleyin</li>
                <li>Sayfa Anahtarı olarak <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">ornek-sayfa</code> girin</li>
                <li>İçeriği düzenleyin ve kaydedin</li>
              </ol>
            </div>
          </div>
        }
        renderContent={(content) => (
          <div className="max-w-4xl mx-auto">
            {/* Burada content içindeki verilere göre özel bir görünüm oluşturabilirsiniz */}
            {content.hero && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-8 mb-8">
                <h1 className="text-3xl font-bold mb-4">{content.hero.title}</h1>
                <p className="text-lg opacity-90">{content.hero.description}</p>
                {content.hero.buttonText && (
                  <button className="mt-6 px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-100 transition-colors">
                    {content.hero.buttonText}
                  </button>
                )}
              </div>
            )}

            {content.features && content.features.length > 0 && (
              <div className="my-12">
                <h2 className="text-2xl font-bold mb-8 text-center">Özellikler</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {content.features.map((feature: any, index: number) => (
                    <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Eğer özel içerik yoksa, tüm JSON'u göster */}
            {(!content.hero && (!content.features || content.features.length === 0)) && (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(content, null, 2)}
              </pre>
            )}
          </div>
        )}
      />
    </div>
  );
} 