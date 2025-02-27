"use client";

import { usePageContent } from "@/hooks/usePageContent";
import { Loader2 } from "lucide-react";

interface PageContentProps {
  pageKey: string;
  fallback?: React.ReactNode;
  renderContent?: (content: any) => React.ReactNode;
  showLoader?: boolean;
  showError?: boolean;
}

/**
 * Sayfa içeriğini görüntülemek için kullanılan bileşen
 * @param pageKey Sayfa anahtarı (örn: "home", "about", "contact")
 * @param fallback İçerik yüklenemediğinde gösterilecek yedek içerik
 * @param renderContent İçeriği özelleştirmek için render fonksiyonu
 * @param showLoader Yükleme göstergesini gösterme durumu
 * @param showError Hata mesajını gösterme durumu
 */
export default function PageContent({
  pageKey,
  fallback,
  renderContent,
  showLoader = true,
  showError = true,
}: PageContentProps) {
  const { pageContent, isLoading, error } = usePageContent(pageKey);

  // Yükleniyor durumu
  if (isLoading && showLoader) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Hata durumu
  if (error && showError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  // İçerik bulunamadı ve fallback yok
  if (!pageContent && !fallback) {
    return null;
  }

  // İçerik bulunamadı ve fallback var
  if (!pageContent && fallback) {
    return <>{fallback}</>;
  }

  // Özel render fonksiyonu varsa kullan
  if (renderContent && pageContent) {
    return <>{renderContent(pageContent.content)}</>;
  }

  // Varsayılan olarak JSON içeriği pre tag içinde göster
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{pageContent?.title}</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">{pageContent?.description}</p>
      
      {/* JSON içeriğini göster (geliştirme amaçlı) */}
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto text-sm">
        {JSON.stringify(pageContent?.content, null, 2)}
      </pre>
    </div>
  );
} 