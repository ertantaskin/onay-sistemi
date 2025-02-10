'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from '@/app/ThemeContext';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success('Giriş başarılı!');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-96px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full">
        <div className="text-center relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl transform -rotate-6"></div>
          <Image
            src="/logo.png"
            alt="Logo"
            width={64}
            height={64}
            className="relative mx-auto h-16 w-16 drop-shadow-xl"
            priority
          />
          <h2 className={`mt-6 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
            theme === 'dark' 
              ? 'from-blue-400 to-blue-600' 
              : 'from-blue-600 to-blue-800'
          }`}>
            Hesabınıza Giriş Yapın
          </h2>
          <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Veya{' '}
            <Link 
              href="/auth/register" 
              className={`font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              yeni bir hesap oluşturun
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
                      : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white'
                  }`}
                  placeholder="ornek@email.com"
                />
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                  formData.email ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}>
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Şifre
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`appearance-none block w-full px-4 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 focus:bg-gray-700' 
                      : 'bg-gray-50/50 border-gray-300 text-gray-900 hover:bg-gray-50/70 focus:bg-white'
                  }`}
                  placeholder="••••••••"
                />
                <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${
                  formData.password ? 'opacity-100' : 'opacity-0'
                } transition-opacity duration-200`}>
                  <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
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
                } bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'focus:ring-offset-gray-800' : ''
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                    Giriş yapılıyor...
                  </div>
                ) : (
                  <>
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg className="h-5 w-5 text-blue-200 group-hover:text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </span>
                    Giriş Yap
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