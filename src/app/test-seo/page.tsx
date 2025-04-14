'use client';

import { useEffect } from 'react';
import SeoHead from '@/components/seo/SeoHead';

export default function TestSeoPage() {
  useEffect(() => {
    // Meta içeriğini kontrol et
    const checkMetaTags = () => {
      console.log('Meta tag check: title =', document.title);
      
      const tags = [
        { type: 'name', name: 'description' },
        { type: 'name', name: 'keywords' },
        { type: 'property', name: 'og:title' },
        { type: 'property', name: 'og:description' },
        { type: 'property', name: 'og:type' },
        { type: 'property', name: 'og:url' },
        { type: 'name', name: 'twitter:card' },
        { type: 'name', name: 'twitter:title' },
        { type: 'name', name: 'twitter:description' },
        { type: 'name', name: 'robots' },
      ];
      
      tags.forEach(tag => {
        const element = document.querySelector(`meta[${tag.type}="${tag.name}"]`);
        console.log(`Meta tag ${tag.name} =`, element ? element.getAttribute('content') : 'not found');
      });
      
      // Canonical link kontrolü
      const canonical = document.querySelector('link[rel="canonical"]');
      console.log('Canonical link =', canonical ? canonical.getAttribute('href') : 'not found');
      
      // JSON-LD kontrolü
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      console.log('JSON-LD =', jsonLd ? 'found' : 'not found');
    };
    
    // Sayfa yüklendikten 2 saniye sonra kontrol et (DOM'un tamamen yüklenmesi için)
    setTimeout(checkMetaTags, 2000);
  }, []);
  
  // Zengin SEO verileri
  const seoData = {
    title: "SEO Test Sayfası",
    description: "Bu, SEO meta etiketlerini test etmek için özel bir sayfadır.",
    keywords: "test,seo,meta,etiketler",
    ogTitle: "SEO Test • Özel Başlık",
    ogDesc: "Sosyal medya paylaşımları için özel açıklama",
    ogImage: "https://example.com/images/test.jpg",
    canonical: "https://example.com/test-seo",
    robots: "index, follow",
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "SEO Test Sayfası",
      "description": "Bu, SEO meta etiketlerini test etmek için özel bir sayfadır."
    }
  };

  return (
    <>
      {/* SEO bileşeni */}
      <SeoHead customData={seoData} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">SEO Test Sayfası</h1>
          
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Bu Sayfa Hakkında</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Bu sayfa, SEO meta etiketlerinin doğru şekilde uygulanıp uygulanmadığını test etmek için oluşturulmuştur.
              Tarayıcı konsolunda meta etiketleri kontrol edilecektir.
            </p>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Edilen Meta Etiketleri</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">title</code> - Sayfa başlığı</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">description</code> - Sayfa açıklaması</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">keywords</code> - Anahtar kelimeler</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">og:title</code> - Open Graph başlığı</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">og:description</code> - Open Graph açıklaması</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">og:type</code> - Open Graph türü</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">og:url</code> - Open Graph URL'si</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">og:image</code> - Open Graph resmi</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">twitter:card</code> - Twitter kart türü</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">twitter:title</code> - Twitter başlığı</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">twitter:description</code> - Twitter açıklaması</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">robots</code> - Robots direktifi</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">canonical</code> - Canonical link</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">JSON-LD</code> - Yapılandırılmış veri</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
} 