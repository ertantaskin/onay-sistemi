'use client';

import { useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IIDForm } from '@/components/forms/IIDForm';
import { Toaster } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Link from 'next/link';
import { usePageContent } from '@/hooks/usePageContent';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Home() {
  const { theme } = useTheme();
  const { pageContent, isLoading: pageLoading } = usePageContent("home");

  const slides = [
    {
      title: 'Hızlı ve Güvenli Onay',
      description: 'Saniyeler içinde Microsoft ürünleriniz için onay alın',
      image: '/slider/slide1.jpg'
    },
    {
      title: '7/24 Destek',
      description: 'Teknik ekibimiz her zaman yanınızda',
      image: '/slider/slide2.jpg'
    },
    {
      title: 'Uygun Fiyatlar',
      description: 'Ekonomik fiyatlarla profesyonel hizmet',
      image: '/slider/slide3.jpg'
    }
  ];

  // Sayfa başlığı ve açıklaması için varsayılan değerler
  const pageTitle = pageContent?.metaTitle || "Microsoft Onay Sistemi";
  const pageDescription = pageContent?.metaDesc || "Microsoft ürünleriniz için hızlı ve güvenli onay alın. 7/24 destek ve uygun fiyatlar.";

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
    
    // Temizleme fonksiyonu
    return () => {
      document.title = "Microsoft Onay Sistemi";
    };
  }, [pageTitle, pageDescription]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />

      {/* Hero Section with Slider */}
      <section className="pt-16 relative overflow-hidden">
        <Swiper
          spaceBetween={0}
          centeredSlides={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="h-[500px] w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              <div className="relative z-20 h-full flex items-center">
                <div className="container mx-auto px-4">
                  <div className="max-w-2xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                      {slide.title}
                    </h2>
                    <p className="text-xl text-white/90">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg transform hover:-translate-y-1 transition-all duration-200`}>
              <div className="w-14 h-14 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Hızlı İşlem</h3>
              <p className="text-base opacity-75">Saniyeler içinde onay numaranızı alın ve hemen kullanmaya başlayın.</p>
            </div>

            <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg transform hover:-translate-y-1 transition-all duration-200`}>
              <div className="w-14 h-14 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Güvenli</h3>
              <p className="text-base opacity-75">SSL korumalı altyapı ve güvenli ödeme seçenekleriyle güvende kalın.</p>
            </div>

            <div className={`p-8 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg transform hover:-translate-y-1 transition-all duration-200`}>
              <div className="w-14 h-14 rounded-lg bg-blue-500 text-white flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">7/24 Aktif</h3>
              <p className="text-base opacity-75">Kesintisiz hizmet ve teknik destek ile her an yanınızdayız.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gradient-to-b from-transparent to-blue-50 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Microsoft Onay Numarası Alın</h2>
              <p className="text-lg opacity-75">IID numaranızı girerek hemen onay numaranızı alabilirsiniz.</p>
            </div>
            <IIDForm />
          </div>
        </div>
      </section>

      {/* Store Section */}
      <section className="py-16 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-950/20 dark:to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Microsoft Lisans Mağazamızı Keşfedin</h2>
            <p className="text-lg opacity-75 mb-8">Orijinal Microsoft lisanslarını uygun fiyatlarla satın alabilirsiniz.</p>
            <div className="flex justify-center">
              <Link 
                href="/store" 
                className={`inline-flex items-center px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl ${
                  theme === 'dark' ? 'hover:bg-blue-500' : 'hover:bg-blue-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Mağazaya Git
              </Link>
            </div>
          </div>
        </div>
      </section>

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
