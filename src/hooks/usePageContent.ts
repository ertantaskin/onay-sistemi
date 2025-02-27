"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface PageContent {
  id: string;
  pageKey: string;
  title: string;
  description: string;
  metaTitle?: string;
  metaDesc?: string;
  content: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Belirli bir sayfa anahtarına göre sayfa içeriğini getiren hook
 * @param pageKey Sayfa anahtarı (örn: "home", "about", "contact")
 * @returns Sayfa içeriği, yükleme durumu ve hata bilgisi
 */
export function usePageContent(pageKey: string) {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Sayfa değiştiğinde state'i sıfırla
    setPageContent(null);
    setIsLoading(true);
    setError(null);
    
    const fetchPageContent = async () => {
      if (!pageKey) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Cache'i önlemek için timestamp ekleyelim
        const timestamp = new Date().getTime();
        const cacheKey = `${pageKey}_${timestamp}`;
        
        const response = await fetch(`/api/page-content/${pageKey}?t=${timestamp}&nocache=${cacheKey}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setError(`"${pageKey}" için sayfa içeriği bulunamadı`);
          } else {
            const errorData = await response.json();
            setError(errorData.error || "Sayfa içeriği yüklenirken bir hata oluştu");
          }
          setPageContent(null);
          return;
        }

        const data = await response.json();
        setPageContent(data);
      } catch (err) {
        console.error("Sayfa içeriği yüklenirken hata:", err);
        setError("Sayfa içeriği yüklenirken bir hata oluştu");
        setPageContent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageContent();
  }, [pageKey, pathname]); // pathname ekleyerek sayfa değişimlerini izleyelim

  return { pageContent, isLoading, error };
} 