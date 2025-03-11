'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from '@/app/ThemeContext';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { usePageContent } from '@/hooks/usePageContent';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { pageContent, isLoading: pageLoading } = usePageContent("login");

  // Sayfa başlığı ve açıklaması için varsayılan değerler - sadece meta veriler düzenlenebilir
  const pageTitle = pageContent?.metaTitle || "Giriş Yap - Microsoft Onay Sistemi";
  const pageDescription = pageContent?.metaDesc || "Microsoft Onay Sistemi'ne giriş yapın ve hızlı onay hizmetlerimizden yararlanın.";

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

    try {
      console.log('Giriş denemesi yapılıyor:', formData.email);
      
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      console.log('Giriş sonucu:', result);

      if (result?.error) {
        console.error('Giriş hatası:', result.error);
        let errorMessage = 'Giriş başarısız!';
        
        switch (result.error) {
          case 'CredentialsSignin':
            errorMessage = 'Email veya şifre hatalı!';
            break;
          case 'Email ve şifre gerekli':
            errorMessage = 'Lütfen email ve şifrenizi girin.';
            break;
          case 'Kullanıcı bulunamadı':
            errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı.';
            break;
          case 'Geçersiz şifre':
            errorMessage = 'Girdiğiniz şifre hatalı.';
            break;
          default:
            errorMessage = result.error;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } else {
        console.log('Giriş başarılı, sepet birleştirme deneniyor...');
        
        try {
          const mergeResponse = await fetch('/api/store/cart/merge', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log('Sepet birleştirme sonucu:', await mergeResponse.json());
        } catch (mergeError) {
          console.error('Sepet aktarma hatası:', mergeError);
        }

        toast.success('Giriş başarılı!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 overflow-x-hidden pt-16">
      {/* Sol taraf - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-8 md:pt-20">
        <div className="max-w-md w-full">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                    Giriş Başarısız
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4 transform transition-transform hover:scale-110 duration-300">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Hesabınıza Giriş Yapın
            </h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Veya{' '}
              <Link 
                href="/auth/register" 
                className={`font-medium transition-all duration-200 ${
                  theme === 'dark'
                    ? 'text-blue-400 hover:text-blue-300'
                    : 'text-blue-700 hover:text-blue-600'
                }`}
              >
                yeni bir hesap oluşturun
              </Link>
            </p>
          </div>

          <div className={`${
            theme === 'dark' 
              ? 'bg-gray-800/70 backdrop-blur-xl' 
              : 'bg-white/90 backdrop-blur-xl'
          } p-6 sm:p-8 rounded-2xl shadow-xl ring-1 ${
            theme === 'dark' ? 'ring-gray-700' : 'ring-gray-200'
          } relative z-10 transition-all duration-300 hover:shadow-2xl`}>
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700' 
                        : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50/30 focus:bg-white'
                    }`}
                    placeholder="ornek@email.com"
                  />
                  <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                    formData.email ? 'opacity-100' : 'opacity-0'
                  } transition-opacity duration-200`}>
                    <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-blue-500' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Şifre
                  </label>
                  <div className="text-sm">
                    <Link href="/auth/forgot-password" className={`font-medium transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-700 hover:text-blue-600'
                    }`}>
                      Şifremi Unuttum
                    </Link>
                  </div>
                </div>
                <div className="mt-1 relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm transition-all duration-200 ${
                      error 
                        ? 'border-red-500/50 bg-red-500/5 focus:ring-red-500 dark:border-red-500/30 dark:bg-red-500/10' 
                        : theme === 'dark'
                          ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700 focus:ring-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50/30 focus:bg-white focus:ring-blue-500'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${
                      theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors duration-200 focus:outline-none`}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <EyeIcon className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className={`h-4 w-4 rounded border-gray-300 ${theme === 'dark' ? 'bg-gray-700 text-blue-500' : 'bg-white text-blue-600'} focus:ring-blue-500`}
                  />
                  <label htmlFor="remember-me" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Beni hatırla
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                    loading
                      ? 'bg-blue-400 cursor-not-allowed'
                      : theme === 'dark'
                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 transform hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-blue-700 hover:bg-blue-800 focus:ring-blue-600 transform hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Giriş Yapılıyor...
                    </>
                  ) : (
                    'Giriş Yap'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Mobil için alt kısım bilgileri */}
      <div className="md:hidden bg-gradient-to-b from-blue-600 to-blue-800 p-6 mt-4 mb-10">
        <div className="flex flex-col space-y-4">
          {/* Windows Aktivasyon Ekranı - Mobil */}
          <div className="bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl p-3 mb-2 mx-auto max-w-xs transform rotate-1">
            <div className="flex items-center mb-2 border-b border-gray-200 pb-2">
              <div className="w-4 h-4 mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
                  <path fill="#F1511B" d="M1 1h10v10H1z"/>
                  <path fill="#80CC28" d="M12 1h10v10H12z"/>
                  <path fill="#00ADEF" d="M1 12h10v10H1z"/>
                  <path fill="#FBBC09" d="M12 12h10v10H12z"/>
                </svg>
              </div>
              <span className="text-gray-800 font-medium text-xs">Windows Aktivasyon</span>
              <div className="ml-auto flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-gray-700 text-xs mb-1">Ürün anahtarınızı girin:</p>
              <div className="bg-gray-100 p-2 rounded border border-gray-300 text-center mb-2">
                <p className="text-gray-800 font-mono text-xs tracking-wider whitespace-nowrap">XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-2 rounded text-xs">
                İptal
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded text-xs">
                Etkinleştir
              </button>
            </div>
          </div>

          {/* Office Aktivasyon Ekranı - Mobil */}
          <div className="bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl p-3 mb-2 mx-auto max-w-xs transform -rotate-1">
            <div className="flex items-center mb-2 border-b border-gray-200 pb-2">
              <div className="w-4 h-4 mr-2">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.42L6 11.56l-.92-2.7H2.94l1.74 3.6-1.74 3.48h2.14zM14.25 21v-3h-3v3zm0-4.5v-3.75h-3v3.75zm0-5.25V7.5h-3v3.75zm0-5.25V3h-3v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3z" fill="#d83b01"/>
                </svg>
              </div>
              <span className="text-gray-800 font-medium text-xs">Office Aktivasyon</span>
              <div className="ml-auto flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-gray-700 text-xs mb-1">Office ürün anahtarınızı girin:</p>
              <div className="bg-gray-100 p-2 rounded border border-gray-300 text-center mb-2">
                <p className="text-gray-800 font-mono text-xs tracking-wider whitespace-nowrap">XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
              </div>
            </div>
            <div className="flex justify-between">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-2 rounded text-xs">
                İptal
              </button>
              <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-2 rounded text-xs">
                Etkinleştir
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6 mb-4">
          <div className="p-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl transform transition-transform hover:scale-105 duration-300 shadow-xl">
            <Image 
              src="/logo.png" 
              alt="Microsoft Onay Sistemi" 
              width={60} 
              height={60} 
              className="rounded-lg"
            />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-4 text-center">Microsoft Lisans Merkezi</h3>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 transform transition-all hover:shadow-xl hover:bg-white/20 duration-300">
          <p className="text-white/90 mb-4 text-sm">
            Orijinal Microsoft ürünleri için lisans aktivasyon ve yönetim platformu.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-blue-500/30 rounded-lg mr-3">
                <svg className="h-4 w-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-xs">Windows Lisansları</h3>
                <p className="text-white/70 text-xs mt-0.5">Windows 10, 11 Pro ve Home</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-blue-500/30 rounded-lg mr-3">
                <svg className="h-4 w-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-xs">Office Paketleri</h3>
                <p className="text-white/70 text-xs mt-0.5">Office 365, 2021 ve daha fazlası</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-blue-500/30 rounded-lg mr-3">
                <svg className="h-4 w-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-xs">Antivirüs Yazılımları</h3>
                <p className="text-white/70 text-xs mt-0.5">Microsoft Defender ve diğer çözümler</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 p-1.5 bg-blue-500/30 rounded-lg mr-3">
                <svg className="h-4 w-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-medium text-xs">Anında Aktivasyon</h3>
                <p className="text-white/70 text-xs mt-0.5">Satın alımdan sonra hemen kullanım</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-5 h-5 rounded-full border-2 border-blue-700 ${i === 1 ? 'bg-blue-500/80' : i === 2 ? 'bg-blue-600/80' : i === 3 ? 'bg-blue-700/80' : 'bg-blue-800/80'} flex items-center justify-center overflow-hidden`}>
                      {i === 1 && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      )}
                      {i === 2 && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                      )}
                      {i === 3 && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                      )}
                      {i === 4 && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-white/80 text-xs ml-1.5">+10.000 lisans satışı</p>
              </div>
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-white/80 text-xs ml-1">4.9/5</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ taraf - Görsel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden md:min-h-screen">
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        
        {/* Dekoratif elementler */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-300/20 rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/20 rounded-full filter blur-2xl"></div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center p-10">
          <div className="max-w-lg z-10 w-full">
            <div className="mb-8 flex justify-center">
              <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl transform transition-transform hover:scale-105 duration-300 shadow-xl">
                <Image 
                  src="/logo.png" 
                  alt="Microsoft Onay Sistemi" 
                  width={80} 
                  height={80} 
                  className="rounded-xl"
                />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-6 text-center">Microsoft Lisans Merkezi</h2>
            
            {/* Aktivasyon Kartları - Yan Yana */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
              {/* Windows Aktivasyon Ekranı */}
              <div className="bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl p-4 transform rotate-1 md:w-[320px]">
                <div className="flex items-center mb-3 border-b border-gray-200 pb-2">
                  <div className="w-5 h-5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
                      <path fill="#F1511B" d="M1 1h10v10H1z"/>
                      <path fill="#80CC28" d="M12 1h10v10H12z"/>
                      <path fill="#00ADEF" d="M1 12h10v10H1z"/>
                      <path fill="#FBBC09" d="M12 12h10v10H12z"/>
                    </svg>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Windows Aktivasyon</span>
                  <div className="ml-auto flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-gray-700 text-xs mb-2">Windows'unuzu etkinleştirmek için ürün anahtarınızı girin:</p>
                  <div className="bg-gray-100 p-2 rounded border border-gray-300 text-center mb-2">
                    <p className="text-gray-800 font-mono text-xs tracking-wider whitespace-nowrap">XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-3 rounded transition-colors duration-200">
                    İptal
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-3 rounded transition-colors duration-200">
                    Etkinleştir
                  </button>
                </div>
              </div>

              {/* Office Aktivasyon Ekranı */}
              <div className="bg-white/90 backdrop-blur-md rounded-lg border border-gray-200 shadow-xl p-4 transform -rotate-1 md:w-[320px]">
                <div className="flex items-center mb-3 border-b border-gray-200 pb-2">
                  <div className="w-5 h-5 mr-2">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23 1.5q.41 0 .7.3.3.29.3.7v19q0 .41-.3.7-.29.3-.7.3H7q-.41 0-.7-.3-.3-.29-.3-.7V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h5V2.5q0-.41.3-.7.29-.3.7-.3zM6 13.28l1.42 2.66h2.14l-1.74-3.48 1.74-3.6H7.42L6 11.56l-.92-2.7H2.94l1.74 3.6-1.74 3.48h2.14zM14.25 21v-3h-3v3zm0-4.5v-3.75h-3v3.75zm0-5.25V7.5h-3v3.75zm0-5.25V3h-3v3zm8.25 15v-3h-6.75v3zm0-4.5v-3.75h-6.75v3.75zm0-5.25V7.5h-6.75v3.75zm0-5.25V3h-6.75v3z" fill="#d83b01"/>
                    </svg>
                  </div>
                  <span className="text-gray-800 font-medium text-sm">Office Aktivasyon</span>
                  <div className="ml-auto flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-gray-700 text-xs mb-2">Microsoft Office'inizi etkinleştirmek için ürün anahtarınızı girin:</p>
                  <div className="bg-gray-100 p-2 rounded border border-gray-300 text-center mb-2">
                    <p className="text-gray-800 font-mono text-xs tracking-wider whitespace-nowrap">XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
                  </div>
                </div>
                <div className="flex justify-between">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs py-1 px-3 rounded transition-colors duration-200">
                    İptal
                  </button>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white text-xs py-1 px-3 rounded transition-colors duration-200">
                    Etkinleştir
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 transform transition-all hover:shadow-xl hover:bg-white/20 duration-300">
              <p className="text-white/90 mb-6">
                Orijinal Microsoft ürünleri için lisans aktivasyon ve yönetim platformu.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-500/30 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Windows Lisansları</h3>
                    <p className="text-white/70 text-xs mt-1">Windows 10, 11 Pro ve Home sürümleri</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-500/30 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Office Paketleri</h3>
                    <p className="text-white/70 text-xs mt-1">Office 365, 2021, 2019 ve daha fazlası</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-500/30 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Antivirüs Yazılımları</h3>
                    <p className="text-white/70 text-xs mt-1">Microsoft Defender ve diğer güvenlik çözümleri</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 p-2 bg-blue-500/30 rounded-lg mr-3">
                    <svg className="h-5 w-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">Anında Aktivasyon</h3>
                    <p className="text-white/70 text-xs mt-1">Satın alımdan sonra hemen kullanıma başlayın</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-blue-700 ${i === 1 ? 'bg-blue-500/80' : i === 2 ? 'bg-blue-600/80' : i === 3 ? 'bg-blue-700/80' : 'bg-blue-800/80'} flex items-center justify-center overflow-hidden`}>
                          {i === 1 && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          )}
                          {i === 2 && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                          )}
                          {i === 3 && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                          )}
                          {i === 4 && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 12.094A5.973 5.973 0 004 15v1H1v-1a3 3 0 013.75-2.906z" />
                            </svg>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-white/80 text-xs ml-2">+10.000 lisans satışı</p>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-white/80 text-xs ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-800 to-transparent"></div>
      </div>
    </div>
  );
}