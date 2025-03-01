'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from '@/app/ThemeContext';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePageContent } from '@/hooks/usePageContent';

export default function RegisterPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { pageContent, isLoading: pageLoading } = usePageContent("register");

  // Sayfa başlığı ve açıklaması için varsayılan değerler - sadece meta veriler düzenlenebilir
  const pageTitle = pageContent?.metaTitle || "Kayıt Ol - Microsoft Onay Sistemi";
  const pageDescription = pageContent?.metaDesc || "Microsoft Onay Sistemi'ne üye olun ve hızlı onay hizmetlerimizden yararlanın.";

  // useEffect ile meta etiketlerini güncelleyelim
  useEffect(() => {
    // Sayfa başlığını güncelle
    document.title = pageTitle;
    
    // Meta açıklamasını güncelle
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    // Open Graph meta etiketlerini güncelle
    const updateOgMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateMetaTag('description', pageDescription);
    updateOgMetaTag('og:title', pageTitle);
    updateOgMetaTag('og:description', pageDescription);
    updateOgMetaTag('twitter:title', pageTitle);
    updateOgMetaTag('twitter:description', pageDescription);
    
    // Temizleme fonksiyonu
    return () => {
      document.title = "Microsoft Onay Sistemi";
    };
  }, [pageTitle, pageDescription]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      toast.error('Şifreler eşleşmiyor!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu.');
      }

      toast.success('Kayıt başarılı! Giriş yapabilirsiniz.');
      router.push('/auth/login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                  Kayıt Başarısız
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-green-500/30 via-green-400/20 to-green-300/10 rounded-full shadow-xl transform -rotate-12 blur-[64px]"></div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-green-400/30 via-green-500/20 to-green-600/10 rounded-full shadow-xl transform rotate-12 blur-[64px]"></div>
          <div className="relative">
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-green-600/5 via-green-500/5 to-green-400/5 backdrop-blur-xl border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-green-500/10 to-green-400/10 rounded-2xl blur-md opacity-50"></div>
              <svg className="relative w-16 h-16 mx-auto text-green-500 transform hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <h2 className={`mt-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-green-400 to-green-600' 
              : 'from-green-600 to-green-800'
          } drop-shadow-sm`}>
            Yeni Hesap Oluşturun
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Veya{' '}
            <Link 
              href="/auth/login" 
              className={`font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-green-400 hover:text-green-300'
                  : 'text-green-600 hover:text-green-500'
              }`}
            >
              mevcut hesabınıza giriş yapın
            </Link>
          </p>
        </div>

        <div className={`mt-8 ${
          theme === 'dark' 
            ? 'bg-gray-800/50 backdrop-blur-xl' 
            : 'bg-white/80 backdrop-blur-xl'
        } p-8 rounded-2xl shadow-2xl ring-1 ring-gray-900/5`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Ad Soyad
              </label>
              <div className="mt-1 relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700' 
                      : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white'
                  }`}
                  placeholder="John Doe"
                />
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                  formData.name ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}>
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Adresi
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700' 
                      : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white'
                  }`}
                  placeholder="ornek@email.com"
                />
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                  formData.email ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}>
                  <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Şifre
              </label>
              <div className="mt-1 relative group">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 ${
                    error 
                      ? 'border-red-500/50 bg-red-500/5 focus:ring-red-500 dark:border-red-500/30 dark:bg-red-500/10' 
                      : theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700 focus:ring-green-500' 
                        : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white focus:ring-green-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${
                    error
                      ? theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Şifre Tekrar
              </label>
              <div className="mt-1 relative group">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 ${
                    error 
                      ? 'border-red-500/50 bg-red-500/5 focus:ring-red-500 dark:border-red-500/30 dark:bg-red-500/10' 
                      : theme === 'dark'
                        ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700 focus:ring-green-500' 
                        : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white focus:ring-green-500'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 ${
                    error
                      ? theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-700'
                      : theme === 'dark'
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white transition-all duration-200 ${
                  loading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]'
                } bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                  theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                    Hesap oluşturuluyor...
                  </div>
                ) : (
                  <>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-green-200 group-hover:text-green-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </span>
                    Hesap Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 