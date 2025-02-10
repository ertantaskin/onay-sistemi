'use client';

import { useTheme } from './ThemeContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IIDForm } from '@/components/forms/IIDForm';
import { Toaster } from 'react-hot-toast';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Home() {
  const { theme } = useTheme();

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
