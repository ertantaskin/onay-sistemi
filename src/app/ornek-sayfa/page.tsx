'use client';

import { useEffect } from "react";
import { useTheme } from "../ThemeContext";
import SeoHead from '@/components/seo/SeoHead';

export default function OrnekSayfa() {
  const { theme } = useTheme();
  
  // SEO verileri
  const seoData = {
    title: "Örnek Sayfa - Microsoft Onay Sistemi",
    description: "Bu, Next.js ile oluşturulmuş bir örnek sayfadır.",
    keywords: "örnek,sayfa,microsoft,onay,sistemi",
    ogTitle: "Örnek Sayfa | Microsoft Onay Sistemi",
    ogDesc: "Microsoft onay sistemi için örnek bir sayfa içeriği",
  };

  return (
    <>
      {/* SEO bileşeni */}
      <SeoHead customData={seoData} />
      
      <div className="container mx-auto px-4 py-8">
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
      </div>
    </>
  );
} 