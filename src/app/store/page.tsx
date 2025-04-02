"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2, ShoppingCart, Tag, Package, Shield, CheckCircle, Clock, CreditCard, Search, Star, TrendingUp, Zap, Gift, ChevronDown, ChevronUp, Heart, Eye, Sparkles } from "lucide-react";
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
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

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
  
  useEffect(() => {
    document.title = pageTitle;
    
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

    updateMetaTag('description', pageDescription);
    updateOgMetaTag('og:title', pageTitle);
    updateOgMetaTag('og:description', pageDescription);
    updateOgMetaTag('og:type', 'website');
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);

    return () => {
      document.title = "";
    };
  }, [pageTitle, pageDescription, pageContent]);

  // Sayfa içeriği
  const products = pageContent?.content?.products || [];
  // Sayfa kategorileri için API'den gelen veriyi kullanıyoruz
  const categoriesFromApi = categories;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      
      {/* Hero Section - Modern, Daha Etkileyici */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 overflow-hidden">
        {/* Arka plan efektleri */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-5"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-radial from-blue-400/20 to-transparent opacity-40 blur-3xl"></div>
          <div className="absolute -left-24 top-1/4 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute -right-24 -bottom-12 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-32 h-32 rounded-full bg-cyan-300/20 blur-2xl animate-pulse"></div>
          </div>
        
        {/* Ana içerik */}
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* Sol taraf - Metin içeriği */}
              <div className="text-center md:text-left relative">
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/10">
                  <ShoppingCart className="h-4 w-4 text-blue-300 mr-2" />
                  <span className="text-white text-sm font-medium">%100 Güvenilir Lisans Çözümleri</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
                  Orijinal Microsoft<br/> 
                  <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                    Lisansları
                    <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></span>
                  </span>
              </h1>
                
                <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl relative">
                  <span className="bg-gradient-to-r from-blue-200/20 to-transparent bg-opacity-20 rounded px-1">Anında teslimat</span>, %100 orijinal ürün garantisi ve en uygun fiyatlarla Windows, Office ve diğer Microsoft ürünleri.
              </p>
                
                <div className="flex flex-wrap md:justify-start justify-center gap-4 relative">
                <Link 
                  href="#categories" 
                    className="px-6 py-3 bg-white text-blue-700 font-medium rounded-lg shadow-xl hover:shadow-blue-500/20 transition-all duration-300 flex items-center hover:bg-gray-100 transform hover:-translate-y-1"
                >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Alışverişe Başla
                </Link>
                <Link 
                  href="/store/cart" 
                    className="px-6 py-3 bg-blue-600/50 backdrop-blur-md text-white font-medium rounded-lg shadow-xl hover:shadow-blue-500/20 border border-white/20 transition-all duration-300 flex items-center hover:bg-blue-700/60 transform hover:-translate-y-1"
                >
                    <CreditCard className="h-5 w-5 mr-2" />
                  Sepete Git
                </Link>
                </div>
                
                {/* Güven işaretleri */}
                <div className="mt-10 flex items-center justify-center md:justify-start gap-5 text-white/80">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-xs">Anında Teslimat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-green-400" />
                    <span className="text-xs">Orijinal Lisans</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs">5/5 Yorum</span>
                  </div>
                </div>
              </div>
              
              {/* Sağ taraf - Görsel içerik */}
              <div className="relative">
                {/* 3D Grid efekti */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 animate-grid-movement"></div>
                
                {/* Ürün kartları */}
                <div className="relative grid grid-cols-2 gap-4 perspective-800">
                  {/* Windows Kart */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer flex flex-col items-center border border-white/10 hover:border-white/30 group transform rotate-y-minus-10 translate-z-8 hover:rotate-y-0">
                    <div className="p-3 rounded-full bg-blue-500/30 mb-3 group-hover:bg-blue-500/40 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-blue-200 transition-colors text-center">Windows 11 Pro</h3>
                    <p className="text-white/70 text-xs mt-1 text-center">Ömür boyu lisans</p>
                    <div className="mt-3 px-3 py-1 bg-blue-600/40 rounded-full text-white text-xs font-bold">
                      %60 İndirim
                    </div>
                  </div>
                  
                  {/* Office Kart */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer flex flex-col items-center border border-white/10 hover:border-white/30 group transform rotate-y-10 translate-z-12 hover:rotate-y-0">
                    <div className="p-3 rounded-full bg-red-500/30 mb-3 group-hover:bg-red-500/40 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-red-200 transition-colors text-center">Office 2021 Pro</h3>
                    <p className="text-white/70 text-xs mt-1 text-center">Word, Excel, PowerPoint</p>
                    <div className="mt-3 px-3 py-1 bg-red-600/40 rounded-full text-white text-xs font-bold">
                      En Çok Satan
                    </div>
                  </div>
                  
                  {/* Antivirüs Kart */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer flex flex-col items-center border border-white/10 hover:border-white/30 group transform rotate-y-minus-10 translate-z-0 hover:rotate-y-0">
                    <div className="p-3 rounded-full bg-green-500/30 mb-3 group-hover:bg-green-500/40 transition-colors">
                      <Shield className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-green-200 transition-colors text-center">Antivirüs</h3>
                    <p className="text-white/70 text-xs mt-1 text-center">Güvenlik çözümleri</p>
                    <div className="mt-3 px-3 py-1 bg-green-600/40 rounded-full text-white text-xs font-bold">
                      Yeni Gelen
                    </div>
                  </div>
                  
                  {/* ePin Kart */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:scale-105 hover:bg-white/15 cursor-pointer flex flex-col items-center border border-white/10 hover:border-white/30 group transform rotate-y-10 translate-z-0 hover:rotate-y-0">
                    <div className="p-3 rounded-full bg-purple-500/30 mb-3 group-hover:bg-purple-500/40 transition-colors">
                      <CreditCard className="h-12 w-12 text-white drop-shadow-lg" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-purple-200 transition-colors text-center">Elektronik Pin</h3>
                    <p className="text-white/70 text-xs mt-1 text-center">Oyun ve hediye kodları</p>
                    <div className="mt-3 px-3 py-1 bg-purple-600/40 rounded-full text-white text-xs font-bold">
                      Popüler
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alt kısım efekti */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="particle-1 w-2 h-2 rounded-full bg-white/30 absolute top-1/4 left-1/4 animate-float-slow"></div>
          <div className="particle-2 w-3 h-3 rounded-full bg-blue-300/20 absolute top-1/3 right-1/3 animate-float-medium"></div>
          <div className="particle-3 w-2 h-2 rounded-full bg-indigo-300/30 absolute bottom-1/4 right-1/4 animate-float-fast"></div>
          <div className="particle-4 w-1 h-1 rounded-full bg-white/40 absolute bottom-1/3 left-1/5 animate-float-medium"></div>
          <div className="particle-5 w-2 h-2 rounded-full bg-blue-200/30 absolute top-1/2 right-1/5 animate-float-slow"></div>
        </div>
      </div>

      {/* İndirim Kuponu Bölümü - Modern Tasarım */}
      <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0 z-10">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full mr-3">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-white font-bold">Yeni üyelere özel %10 indirim!</p>
                <p className="text-white/80 text-sm">İlk siparişinizde geçerli, kaçırmayın.</p>
              </div>
            </div>
            <div className="flex items-center z-10">
              <div className="relative group">
                <div className="bg-white pr-4 pl-6 py-3 rounded-l-lg flex items-center border-2 border-white">
                  <span className="font-mono font-bold text-gray-700 tracking-wider relative overflow-hidden">
                    YENİÜYE10
                    <span className="absolute inset-0 bg-yellow-100 animate-pulse opacity-20"></span>
                  </span>
                </div>
                <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">%10</span>
                </div>
              </div>
              <button className="bg-blue-800 text-white py-3 px-4 rounded-r-lg hover:bg-blue-900 transition-colors duration-200 cursor-pointer border-2 border-white flex items-center font-medium">
                <span>Kopyala</span>
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-white/10 via-white/30 to-white/10"></div>
      </div>

      {/* Özellikler Section - Teslimat vurgulaması */}
      <div className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col items-center p-6 rounded-xl bg-blue-50 dark:bg-gray-700/50 border-b-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-center">%100 Orijinal</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">Resmi Microsoft Lisansları</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-xl bg-green-50 dark:bg-gray-700/50 border-b-4 border-green-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <Zap className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-center text-green-700 dark:text-green-400">Anında E-Posta</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">Otomatik Teslimat</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-xl bg-yellow-50 dark:bg-gray-700/50 border-b-4 border-yellow-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mb-4">
                <Star className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="font-semibold text-center">En İyi Fiyat</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">Uygun Fiyat Garantisi</p>
            </div>
            
            <div className="flex flex-col items-center p-6 rounded-xl bg-purple-50 dark:bg-gray-700/50 border-b-4 border-purple-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                <Clock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-center">7/24 Destek</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-2">Her Zaman Yanınızda</p>
            </div>
          </div>
        </div>
        </div>

        {/* Categories Section */}
      <div id="categories" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div>
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-3">
                <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-1.5" />
                <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">Tüm Kategoriler</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">Microsoft Ürün Kategorileri</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
              İhtiyacınıza uygun Microsoft ürünlerini kategorilere göre inceleyebilirsiniz.
            </p>
            </div>
            <Link 
              href="/store/categories" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline mt-4 md:mt-0"
            >
              Tüm kategorileri görüntüle
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Kategoriler yükleniyor...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {/* Windows Kategorisi */}
              <Link href="/store/category/windows" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                    theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                  }`}>
                  <div className="relative h-24 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                          </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Windows</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">İşletim sistemleri</p>
                  </div>
                </div>
              </Link>

              {/* Office Kategorisi */}
              <Link href="/store/category/office" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="relative h-24 bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.46L6 11.38l-.46-2.52H3.4l-.9 3.6L1.6 15.94h2.04zM14.25 22.5v-19h-7.5v5H9v9h-2.5v5z"/>
                          </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Office</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Ofis uygulamaları</p>
                  </div>
                </div>
              </Link>

              {/* Antivirüs Kategorisi */}
              <Link href="/store/category/antivirus" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="relative h-24 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <Shield className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">Antivirüs</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Güvenlik yazılımları</p>
                  </div>
                </div>
              </Link>

              {/* ePin Kategorisi */}
              <Link href="/store/category/epin" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="relative h-24 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <CreditCard className="h-12 w-12 text-white" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">ePin</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Oyun ve hediye kartları</p>
                  </div>
                      </div>
              </Link>

              {/* Server Kategorisi */}
              <Link href="/store/category/server" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="relative h-24 bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                      <line x1="6" y1="6" x2="6.01" y2="6"></line>
                      <line x1="6" y1="18" x2="6.01" y2="18"></line>
                          </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors">Server</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Sunucu yazılımları</p>
                      </div>
                </div>
              </Link>

              {/* Visual Studio Kategorisi */}
              <Link href="/store/category/visual-studio" className="group">
                <div className={`h-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white'
                }`}>
                  <div className="relative h-24 bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-pattern-dots opacity-20"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.583 1.424l-5.657 17.666-9.278-15.607-1.355 1.472 9.356 15.748 7.044-21.698 2.307-.347v21.349l-2.307-.347-7.05-21.662-9.35 15.712-1.35-1.478 9.272-15.572 5.662 17.598 5.428-.816v-16.174z"/>
                    </svg>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Visual Studio</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Geliştirici araçları</p>
                    </div>
                  </div>
                </Link>
            </div>
          )}

          {!loading && categoriesFromApi.length === 0 && (
            <div className={`text-center py-16 px-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Henüz kategori bulunmamaktadır</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                Kategoriler yakında eklenecektir. Lütfen daha sonra tekrar kontrol ediniz.
              </p>
            </div>
          )}
        </div>
        </div>

      {/* Featured Products Section */}
      <div className="py-16 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10">
            <div>
              <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full mb-3">
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 mr-1.5" />
                <span className="text-blue-700 dark:text-blue-300 text-xs font-medium">Öne Çıkan Ürünler</span>
              </div>
              <h2 className="text-2xl font-bold mb-1">En Çok Tercih Edilenler</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Kullanıcılarımız tarafından en çok tercih edilen lisanslarımız
              </p>
            </div>
            <Link 
              href="/store/products" 
              className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline mt-4 md:mt-0"
            >
              Tüm ürünleri görüntüle
              <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            </div>
            
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Ürünler yükleniyor...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Mobil uyumlu responsive grid, xs: 2, sm: 2, lg: 3, xl: 4 kolonlu grid */}
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {/* Windows 11 Pro */}
                <div className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="relative h-32 xs:h-36 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <div className="absolute top-1 left-1 xs:top-2 xs:left-2 sm:top-3 sm:left-3 z-10">
                      <div className="bg-blue-600 text-white text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full font-medium tracking-wide">Popüler</div>
                    </div>
                    <div className="absolute top-1 right-1 xs:top-2 xs:right-2 sm:top-3 sm:right-3 z-10">
                      <button className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center">
                        <Heart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-red-500" />
                      </button>
                    </div>
                    <Image
                      src="/images/products/windows11.webp"
                      alt="Windows 11 Pro"
                      className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                      width={300}
                      height={300}
                      onError={(e) => {
                        e.currentTarget.src = "/images/product-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-2 xs:p-3 sm:p-5">
                    <div className="mb-1 xs:mb-2 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] xs:text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5 block">Microsoft</span>
                        <h3 className="font-medium text-xs sm:text-sm">Windows 11 Pro</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] xs:text-xs line-through text-gray-500">₺1299</span>
                        <span className="text-sm xs:text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">₺499</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 mb-1 xs:mb-2">
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 ml-1">(120+)</span>
                    </div>
                    <p className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400 mb-2 xs:mb-3 sm:mb-4 line-clamp-2">
                      Orijinal lisans, ömür boyu kullanım. E-posta ile anında teslimat.
                    </p>
                    <div className="flex space-x-1 xs:space-x-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 xs:py-1.5 sm:py-2 px-2 xs:px-3 sm:px-4 rounded-md flex items-center justify-center transition-colors text-[10px] xs:text-xs sm:text-sm">
                        <ShoppingCart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mr-1 xs:mr-1.5 sm:mr-2" />
                        Sepete Ekle
                      </button>
                      <button className="flex-shrink-0 border rounded-md p-1 xs:p-1.5 sm:p-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Office 2021 Pro Plus */}
                <div className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="relative h-32 xs:h-36 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <div className="absolute top-1 left-1 xs:top-2 xs:left-2 sm:top-3 sm:left-3 z-10">
                      <div className="bg-orange-600 text-white text-[10px] xs:text-xs px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full font-medium tracking-wide">İndirimde</div>
                    </div>
                    <div className="absolute top-1 right-1 xs:top-2 xs:right-2 sm:top-3 sm:right-3 z-10">
                      <button className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center">
                        <Heart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                    <Image
                      src="/images/products/office2021.webp"
                      alt="Office 2021 Pro Plus"
                      className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                      width={300}
                      height={300}
                      onError={(e) => {
                        e.currentTarget.src = "/images/product-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-2 xs:p-3 sm:p-5">
                    <div className="mb-1 xs:mb-2 flex justify-between items-start">
                      <div>
                        <span className="text-[10px] xs:text-xs font-medium text-orange-600 dark:text-orange-400 mb-0.5 block">Microsoft</span>
                        <h3 className="font-medium text-xs sm:text-sm">Office 2021 Pro Plus</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] xs:text-xs line-through text-gray-500">₺1899</span>
                        <span className="text-sm xs:text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">₺699</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 mb-1 xs:mb-2">
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" />
                      <span className="text-[10px] xs:text-xs text-gray-500 dark:text-gray-400 ml-1">(89)</span>
                    </div>
                    <p className="text-[10px] xs:text-xs text-gray-600 dark:text-gray-400 mb-2 xs:mb-3 sm:mb-4 line-clamp-2">
                      Word, Excel, PowerPoint ve daha fazlası. Kalıcı lisans, tek seferlik ödeme.
                    </p>
                    <div className="flex space-x-1 xs:space-x-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 xs:py-1.5 sm:py-2 px-2 xs:px-3 sm:px-4 rounded-md flex items-center justify-center transition-colors text-[10px] xs:text-xs sm:text-sm">
                        <ShoppingCart className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 mr-1 xs:mr-1.5 sm:mr-2" />
                        Sepete Ekle
                      </button>
                      <button className="flex-shrink-0 border rounded-md p-1 xs:p-1.5 sm:p-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye className="h-3 w-3 xs:h-3.5 xs:w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Windows 10 Pro */}
                <div className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                      <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center">
                        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                    <Image
                      src="/images/products/windows10.webp"
                      alt="Windows 10 Pro"
                      className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                      width={300}
                      height={300}
                      onError={(e) => {
                        e.currentTarget.src = "/images/product-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-3 sm:p-5">
                    <div className="mb-2 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1 block">Microsoft</span>
                        <h3 className="font-medium text-sm">Windows 10 Pro</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs line-through text-gray-500">₺999</span>
                        <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">₺399</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 mb-2">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(215)</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                      Ömür boyu lisans, dijital teslimat. Windows 11'e ücretsiz yükseltme.
                    </p>
                    <div className="flex space-x-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm">
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Sepete Ekle
                      </button>
                      <button className="flex-shrink-0 border rounded-md p-1.5 sm:p-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Office 365 */}
                <div className={`group relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ${
                  theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                }`}>
                  <div className="relative h-40 sm:h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                      <div className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium tracking-wide">Abonelik</div>
                    </div>
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                      <button className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 flex items-center justify-center">
                        <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                    <Image
                      src="/images/products/office365.webp"
                      alt="Microsoft 365"
                      className="object-contain w-full h-full p-4 transition-transform duration-300 group-hover:scale-105"
                      width={300}
                      height={300}
                      onError={(e) => {
                        e.currentTarget.src = "/images/product-placeholder.png";
                      }}
                    />
                  </div>
                  <div className="p-3 sm:p-5">
                    <div className="mb-2 flex justify-between items-start">
                      <div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 mb-1 block">Microsoft</span>
                        <h3 className="font-medium text-sm">Microsoft 365</h3>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">6 Kişi / 1 Yıl</span>
                        <span className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">₺799</span>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-500 mb-2">
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <Star className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(65)</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 line-clamp-2">
                      Tüm Office uygulamaları ve 1TB OneDrive depolama alanı, 6 kullanıcı.
                    </p>
                    <div className="flex space-x-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-md flex items-center justify-center transition-colors text-xs sm:text-sm">
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        Sepete Ekle
                      </button>
                      <button className="flex-shrink-0 border rounded-md p-1.5 sm:p-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-700 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {products.length === 0 && !loading && (
                <div className={`text-center py-16 px-6 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white/60'} shadow-md`}>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Henüz ürün bulunmamaktadır</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
                    Ürünlerimiz yakında eklenecektir. Lütfen daha sonra tekrar kontrol ediniz.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Hemen Alışverişe Başlayın</h2>
            <p className="text-xl text-white/90 mb-8">
              İhtiyacınız olan Microsoft lisansını hemen satın alın ve anında kullanmaya başlayın.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="#categories" 
                className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ürünleri Keşfet
              </Link>
              <Link 
                href="/store/cart" 
                className="px-8 py-4 bg-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Sepete Git
              </Link>
              </div>
            </div>
          </div>
        </div>

      {/* SSS Section - Açılır kapanır ve 2'li grid yapısında */}
      <div className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Sık Sorulan Sorular</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm">
              Microsoft lisansları hakkında merak ettiğiniz sorular ve cevapları
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SSS 1 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(0)}
                >
                  <h3 className="font-bold text-base">Satın aldığım lisanslar tamamen orijinal mi?</h3>
                  {openFaq === 0 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 0 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Evet, satışını yaptığımız tüm lisanslar %100 orijinal Microsoft ürünleridir ve Microsoft lisans koşullarına uygun olarak kullanıma sunulmaktadır.
                    </p>
                  </div>
                )}
              </div>

              {/* SSS 2 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(1)}
                >
                  <h3 className="font-bold text-base">Lisans satın aldıktan sonra ne kadar sürede teslim edilir?</h3>
                  {openFaq === 1 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 1 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Ödemeniz onaylandıktan sonra lisans anahtarınız otomatik olarak sistem tarafından anında e-posta adresinize gönderilir. İşlem tamamen otomatiktir, manuel bir işlem gerektirmez.
                    </p>
                  </div>
                )}
              </div>

              {/* SSS 3 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(2)}
                >
                  <h3 className="font-bold text-base">Satın aldığım lisanslar ömür boyu mu geçerli?</h3>
                  {openFaq === 2 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 2 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Windows ve Office gibi kalıcı lisanslar ömür boyu geçerlidir. Abonelik bazlı ürünler (Microsoft 365, Xbox Game Pass gibi) belirtilen süre boyunca geçerlidir.
                    </p>
                  </div>
                )}
              </div>

              {/* SSS 4 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(3)}
                >
                  <h3 className="font-bold text-base">Lisansımla ilgili bir sorun yaşarsam ne yapmalıyım?</h3>
                  {openFaq === 3 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 3 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Lisansınızla ilgili herhangi bir sorun yaşamanız durumunda 7/24 destek ekibimize ulaşabilirsiniz. Problem çözülemezse, ücret iadesi veya yeni bir lisans anahtarı sağlanır.
                    </p>
                  </div>
                )}
              </div>

              {/* SSS 5 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(4)}
                >
                  <h3 className="font-bold text-base">Lisans anahtarlarını nasıl etkinleştirebilirim?</h3>
                  {openFaq === 4 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 4 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Her ürün için detaylı kurulum ve etkinleştirme kılavuzları e-postanıza gönderilir. Ayrıca web sitemizin destek bölümünde de adım adım rehberler bulabilirsiniz.
                    </p>
                  </div>
                )}
              </div>

              {/* SSS 6 */}
              <div className={`rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-700" : "bg-gray-50"} hover:shadow-md transition-all duration-300`}>
                <div 
                  className="p-4 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleFaq(5)}
                >
                  <h3 className="font-bold text-base">Ödeme yöntemleri nelerdir?</h3>
                  {openFaq === 5 ? 
                    <ChevronUp className="h-5 w-5 text-blue-600 dark:text-blue-400" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  }
                </div>
                {openFaq === 5 && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">
                    <div className="h-px w-full bg-gray-200 dark:bg-gray-600 mb-3"></div>
                    <p>
                      Sitemizde kredi kartı, banka havalesi, EFT ve online ödeme sistemleri gibi birçok ödeme yöntemi kullanabilirsiniz. Tüm işlemler SSL ile şifrelenmiş güvenli bağlantı üzerinden gerçekleştirilir.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link 
                href="/store/faq" 
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium hover:underline transition-colors duration-200"
              >
                Tüm soruları görüntüle
                <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Online Teslimat Vurgulama Bölümü - Daha modern */}
      <div className="py-16 relative bg-gradient-to-r from-green-600 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1">
              <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Zap className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-white text-sm font-medium">Dijital Lisans Avantajı</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Anında <span className="relative inline-block">
                Dijital Teslimat
                <span className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400"></span>
              </span></h2>
              <p className="text-white/90 mb-8 text-lg">
                Ödemeniz onaylandığı anda lisans anahtarınız otomatik olarak e-posta adresinize gönderilir. Manuel işlem gerektirmez, 7/24 hizmetinizdeyiz.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" />
                  <span className="text-white">Otomatik e-posta bildirimi</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" />
                  <span className="text-white">Lisans anahtarı ve kurulum rehberi</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" />
                  <span className="text-white">Sipariş takibi ve geçmişi</span>
                </div>
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mr-3" />
                  <span className="text-white">7/24 teknik destek</span>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/20 w-full md:w-auto flex-shrink-0">
              <div className="flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse rounded-full"></div>
                <Clock className="h-16 w-16 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-1">Ortalama Teslimat Süresi</h3>
                <div className="relative mb-4">
                  <p className="text-5xl font-bold text-white">30</p>
                  <span className="absolute top-0 right-0 bg-yellow-400 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full -mt-2">saniye</span>
                </div>
                <p className="text-white/80">Ödeme onayından sonra</p>
                <div className="mt-6">
                  <Link 
                    href="/store/products" 
                    className="inline-flex items-center justify-center w-full bg-white text-emerald-700 py-3 px-6 rounded-lg font-semibold hover:bg-emerald-50 transition-colors duration-200"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Hemen Satın Al
                  </Link>
                </div>
              </div>
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

      <style jsx global>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-15px) translateX(-10px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(15px); }
        }
        @keyframes grid-movement {
          0% { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        .animate-grid-movement {
          animation: grid-movement 20s linear infinite;
        }
        .perspective-800 {
          perspective: 800px;
        }
        .rotate-y-minus-10 {
          transform: rotateY(-10deg);
        }
        .rotate-y-10 {
          transform: rotateY(10deg);
        }
        .translate-z-0 {
          transform: translateZ(0);
        }
        .translate-z-8 {
          transform: translateZ(8px);
        }
        .translate-z-12 {
          transform: translateZ(12px);
        }
        .hover\:rotate-y-0:hover {
          transform: rotateY(0deg);
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
} 