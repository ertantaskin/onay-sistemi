'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface SeoData {
  title: string;
  description: string;
  keywords?: string;
  ogTitle?: string;
  ogDesc?: string;
  ogImage?: string;
  canonical?: string;
  robots?: string;
  schema?: any;
}

interface SeoHeadProps {
  customData?: SeoData;
  pageType?: string;
}

export default function SeoHead({ customData, pageType = 'page' }: SeoHeadProps) {
  const pathname = usePathname();
  const [seoData, setSeoData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeoData() {
      try {
        setLoading(true);
        
        // Özel veri sağlanmışsa, onu kullan
        if (customData) {
          console.log("Özel SEO verileri kullanılıyor:", customData);
          setSeoData(customData);
          setLoading(false);
          return;
        }
        
        // Aksi takdirde API'den SEO verilerini getir
        const res = await fetch(`/api/seo?path=${pathname}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log("SEO verileri API'den alındı:", data);
          setSeoData(data);
        } else {
          // API hatası durumunda varsayılan verileri kullan
          const defaultData = {
            title: 'Microsoft Onay Sistemi',
            description: 'Microsoft ürünleri için online onay sistemi',
            keywords: 'microsoft,lisans,onay,aktivasyon'
          };
          console.log("SEO API hatası, varsayılan kullanılıyor:", defaultData);
          setSeoData(defaultData);
        }
      } catch (error) {
        console.error('SEO verisi getirme hatası:', error);
        // Hata durumunda varsayılan verileri kullan
        const defaultData = {
          title: 'Microsoft Onay Sistemi',
          description: 'Microsoft ürünleri için online onay sistemi',
          keywords: 'microsoft,lisans,onay,aktivasyon'
        };
        console.log("SEO hatası, varsayılan kullanılıyor:", defaultData);
        setSeoData(defaultData);
      } finally {
        setLoading(false);
      }
    }

    if (pathname) {
      console.log("SEO verisi isteniyor, path:", pathname);
      fetchSeoData();
    }
  }, [pathname, customData]);

  useEffect(() => {
    if (seoData) {
      // Title manuel olarak ayarlanıyor çünkü Helmet bazen yavaş olabilir
      document.title = seoData.title;
      
      // Meta etiketlerini manuel olarak güncelle
      updateMetaTag('description', seoData.description);
      
      if (seoData.keywords) {
        updateMetaTag('keywords', seoData.keywords);
      }
      
      // OG etiketleri
      updateOgMetaTag('og:title', seoData.ogTitle || seoData.title);
      updateOgMetaTag('og:description', seoData.ogDesc || seoData.description);
      updateOgMetaTag('og:type', pageType === 'product' ? 'product' : 'website');
      updateOgMetaTag('og:url', `${process.env.NEXT_PUBLIC_SITE_URL || ''}${pathname}`);
      
      if (seoData.ogImage) {
        updateOgMetaTag('og:image', seoData.ogImage);
      }
      
      // Twitter etiketleri
      updateMetaTag('twitter:card', 'summary_large_image');
      updateMetaTag('twitter:title', seoData.ogTitle || seoData.title);
      updateMetaTag('twitter:description', seoData.ogDesc || seoData.description);
      
      if (seoData.ogImage) {
        updateMetaTag('twitter:image', seoData.ogImage);
      }
      
      // Robots
      if (seoData.robots) {
        updateMetaTag('robots', seoData.robots);
      }
      
      // Canonical
      updateCanonicalLink(seoData.canonical);
      
      // Schema
      updateJsonLdScript(seoData.schema);
    }
  }, [seoData, pathname, pageType]);

  // Meta etiketlerini manuel güncelleme fonksiyonları
  const updateMetaTag = (name: string, content: string) => {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[name="${name}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', name);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
    console.log(`Meta etiketi güncellendi: ${name} = ${content}`);
  };

  const updateOgMetaTag = (property: string, content: string) => {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[property="${property}"]`);
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('property', property);
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', content);
    console.log(`OG etiketi güncellendi: ${property} = ${content}`);
  };

  const updateCanonicalLink = (href?: string) => {
    if (!href) return;
    
    let linkTag = document.querySelector('link[rel="canonical"]');
    if (!linkTag) {
      linkTag = document.createElement('link');
      linkTag.setAttribute('rel', 'canonical');
      document.head.appendChild(linkTag);
    }
    linkTag.setAttribute('href', href);
    console.log(`Canonical link güncellendi: ${href}`);
  };

  const updateJsonLdScript = (schema?: any) => {
    if (!schema || Object.keys(schema).length === 0) return;
    
    const jsonLd = JSON.stringify(schema);
    
    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.innerHTML = jsonLd;
    console.log(`JSON-LD şeması güncellendi`);
  };

  if (loading || !seoData) {
    return null;
  }

  return null; // Bu bileşen artık görünür bir şey döndürmüyor, DOM'u JS ile değiştiriyor
} 