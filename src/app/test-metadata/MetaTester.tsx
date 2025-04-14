'use client';

import { useEffect, useState } from 'react';

interface MetaInfo {
  tagName: string;
  value: string | null;
}

export default function MetaTester() {
  const [metaTags, setMetaTags] = useState<MetaInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Meta etiketlerini kontrol et ve logla
    function checkMetaTags() {
      setIsLoading(true);
      const metaInfo: MetaInfo[] = [];
      
      // Document title
      metaInfo.push({ tagName: 'title', value: document.title });
      
      // Meta etiketleri
      const tags = [
        { selector: 'meta[name="description"]', attr: 'content', name: 'description' },
        { selector: 'meta[name="keywords"]', attr: 'content', name: 'keywords' },
        { selector: 'meta[property="og:title"]', attr: 'content', name: 'og:title' },
        { selector: 'meta[property="og:description"]', attr: 'content', name: 'og:description' },
        { selector: 'meta[property="og:type"]', attr: 'content', name: 'og:type' },
        { selector: 'meta[property="og:url"]', attr: 'content', name: 'og:url' },
        { selector: 'meta[property="og:image"]', attr: 'content', name: 'og:image' },
        { selector: 'meta[name="twitter:card"]', attr: 'content', name: 'twitter:card' },
        { selector: 'meta[name="twitter:title"]', attr: 'content', name: 'twitter:title' },
        { selector: 'meta[name="twitter:description"]', attr: 'content', name: 'twitter:description' },
        { selector: 'meta[name="twitter:image"]', attr: 'content', name: 'twitter:image' },
        { selector: 'meta[name="robots"]', attr: 'content', name: 'robots' },
        { selector: 'link[rel="canonical"]', attr: 'href', name: 'canonical' },
      ];
      
      tags.forEach(tag => {
        const element = document.querySelector(tag.selector);
        metaInfo.push({ 
          tagName: tag.name, 
          value: element ? element.getAttribute(tag.attr) : null 
        });
      });
      
      // JSON-LD
      const jsonLd = document.querySelector('script[type="application/ld+json"]');
      metaInfo.push({ 
        tagName: 'JSON-LD', 
        value: jsonLd ? 'Var' : 'Yok'
      });
      
      console.log('Meta etiketleri:', metaInfo);
      setMetaTags(metaInfo);
      setIsLoading(false);
    }
    
    // İlk sayfa yüklendiğinde ve her yenilemede kontrol et
    checkMetaTags();
    
    // Her 2 saniyede bir kontrol et (yenilemeler sırasında)
    const interval = setInterval(checkMetaTags, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="my-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse">
        <p className="text-center">Meta etiketleri kontrol ediliyor...</p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4">Mevcut Meta Etiketleri</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Etiket
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Değer
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Durum
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {metaTags.map((tag, index) => (
              <tr key={index} className={tag.value ? '' : 'bg-red-50 dark:bg-red-900/20'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {tag.tagName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 max-w-md truncate">
                  {tag.value || 'Yok'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${tag.value ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                                 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {tag.value ? 'Var' : 'Yok'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 