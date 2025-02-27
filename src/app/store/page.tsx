"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ShoppingCart, Tag, Package, Shield, CheckCircle, Clock, CreditCard } from "lucide-react";
import { useTheme } from "../ThemeContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { usePageContent } from "@/hooks/usePageContent";

interface ProductCategory {
  id: string;
  name: string;
  description: string | null;
}

export default function StorePage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { pageContent, isLoading: pageLoading } = usePageContent("store");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/store/categories");
        if (!response.ok) {
          throw new Error("Kategoriler yüklenirken bir hata oluştu");
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Kategoriler yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Sayfa başlığı ve açıklaması için varsayılan değerler
  const pageTitle = pageContent?.metaTitle || "Microsoft Lisans Mağazası";
  const pageDescription = pageContent?.metaDesc || "Orijinal Microsoft lisanslarını uygun fiyatlarla satın alın. Windows, Office ve daha fazlası.";
  
  // useEffect ile meta etiketlerini güncelleyelim
  useEffect(() => {
    // Sayfa başlığını güncelle
    document.title = pageTitle;
    
    // Meta açıklamasını güncelle
    const updateMetaTag = (name: string, content: string) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };

    const updateOgMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    };

    // Meta etiketlerini güncelle
    updateMetaTag('description', pageDescription);
    updateOgMetaTag('og:title', pageTitle);
    updateOgMetaTag('og:description', pageDescription);
    updateOgMetaTag('og:type', 'website');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);

    // Temizleme fonksiyonu - sayfa değiştiğinde meta etiketlerini temizleyelim
    return () => {
      // Sayfa değiştiğinde meta etiketlerini temizleme işlemi
      document.title = ""; // Başlığı temizle, yeni sayfa kendi başlığını ayarlayacak
    };
  }, [pageTitle, pageDescription, pageContent]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      <div className="pt-20"> {/* Padding top for header */}
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-700 to-indigo-800 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center"></div>
          </div>
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6 flex justify-center">
                <div className="bg-white/10 backdrop-blur-sm p-3 rounded-full inline-block">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-15 w-15 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
                Orijinal Microsoft Lisansları
              </h1>
              <p className="text-xl text-white/90 mb-8 animate-fade-in-up">
                Windows, Office, ePin ve daha fazlası için resmi lisansları uygun fiyatlarla satın alın. Anında teslimat ve %100 orijinal ürün garantisi.
              </p>
              <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up">
                <Link 
                  href="#categories" 
                  className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Kategorilere Göz At
                </Link>
                <Link 
                  href="/store/cart" 
                  className="px-6 py-3 bg-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Sepete Git
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-700/20 to-transparent"></div>
        </div>

        {/* Categories Section */}
        <div id="categories" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Ürün Kategorilerimiz</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              İhtiyacınıza uygun Microsoft ürünlerini kategorilere göre inceleyebilirsiniz.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link 
                  href={`/store/category/${category.id}`} 
                  key={category.id}
                  className="group"
                >
                  <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}>
                    <div className="p-6 h-full flex flex-col">
                      <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                        {category.name.toLowerCase().includes('windows') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                          </svg>
                        ) : category.name.toLowerCase().includes('office') ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
                          </svg>
                        ) : category.name.toLowerCase().includes('epin') || category.name.toLowerCase().includes('gift') ? (
                          <CreditCard className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Tag className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{category.name}</h3>
                      {category.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{category.description}</p>
                      )}
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                          Ürünleri Görüntüle
                          <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!loading && categories.length === 0 && (
            <div className={`text-center py-16 px-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-medium mb-2">Henüz kategori bulunmamaktadır</p>
              <p className="text-gray-600 dark:text-gray-400">
                Lütfen daha sonra tekrar kontrol ediniz.
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className={`py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Neden Bizden Satın Almalısınız?</h2>
              <p className="text-lg opacity-80 max-w-2xl mx-auto">
                Müşteri memnuniyeti ve güvenilirlik bizim için en önemli değerlerdir.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300`}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">%100 Orijinal</h3>
                <p className="text-gray-600 dark:text-gray-300">Tüm lisanslarımız orijinal Microsoft ürünleridir ve resmi kanallardan temin edilmektedir.</p>
              </div>
              
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300`}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3">Uygun Fiyat</h3>
                <p className="text-gray-600 dark:text-gray-300">Piyasadaki en uygun fiyatlarla lisans satın alabilirsiniz. Düzenli kampanyalarımızı takip edin.</p>
              </div>
              
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300`}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Anında Teslimat</h3>
                <p className="text-gray-600 dark:text-gray-300">Ödemeniz onaylandıktan hemen sonra lisans anahtarınızı alırsınız. 7/24 destek hizmetimiz mevcuttur.</p>
              </div>
              
              <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} shadow-md hover:shadow-lg transition-all duration-300`}>
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Ömür Boyu Garanti</h3>
                <p className="text-gray-600 dark:text-gray-300">Tüm lisanslarımız ömür boyu garantilidir. Herhangi bir sorun yaşarsanız ücretsiz değişim yapılır.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Highlights Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popüler Ürünlerimiz</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              En çok tercih edilen Microsoft lisansları ve ürünleri
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Windows 11 Pro */}
            <div className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Windows 11 Pro</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Orijinal Windows 11 Pro lisansı, ömür boyu kullanım ve ücretsiz güncellemeler.</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₺799,00</span>
                  <Link href="/store/category/windows" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    İncele
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Microsoft Office 2021 */}
            <div className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className="relative h-48 bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Microsoft Office 2021</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Word, Excel, PowerPoint ve daha fazlası. Tek seferlik ödeme ile ömür boyu kullanım.</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₺1.299,00</span>
                  <Link href="/store/category/office" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    İncele
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Xbox Game Pass */}
            <div className={`rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
              theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}>
              <div className="relative h-48 bg-gradient-to-r from-green-500 to-green-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.43 21.1a10.41 10.41 0 0 0 13.14 0 9.53 9.53 0 0 1-6.57-2.82 9.53 9.53 0 0 1-6.57 2.82zm15.75-2.88a10.5 10.5 0 0 0 1.54-12.96 9.47 9.47 0 0 1-4.33 6.21 10.5 10.5 0 0 1 2.79 6.75zm-20.36 0a10.5 10.5 0 0 1 2.79-6.75 9.47 9.47 0 0 1-4.33-6.21 10.5 10.5 0 0 0 1.54 12.96zM12 2.04a9.45 9.45 0 0 1 6.57 2.62A9.45 9.45 0 0 1 12 2.04zm0 3.67a6.79 6.79 0 1 0 0 13.58 6.79 6.79 0 0 0 0-13.58z"/>
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Xbox Game Pass Ultimate</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Yüzlerce yüksek kaliteli oyuna erişim. PC, konsol ve bulut oyunları için 3 aylık abonelik.</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₺449,00</span>
                  <Link href="/store/category/epin" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    İncele
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <div className={`rounded-2xl overflow-hidden shadow-xl ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-500 to-indigo-600'}`}>
            <div className="px-6 py-12 md:p-12 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Hemen Alışverişe Başlayın</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                İhtiyacınız olan Microsoft lisansını hemen satın alın ve anında kullanmaya başlayın.
              </p>
              <Link 
                href="#categories" 
                className={`inline-block px-8 py-4 rounded-lg font-medium text-lg shadow-lg transform hover:-translate-y-1 transition-all duration-200 ${
                  theme === 'dark' ? 'bg-white text-blue-900 hover:bg-gray-100' : 'bg-blue-800 text-white hover:bg-blue-900'
                }`}
              >
                Şimdi Keşfedin
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
        }}
      />
    </div>
  );
} 