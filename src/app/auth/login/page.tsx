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
    <div className="w-full max-w-md px-4">
      <div className="text-center relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-500/30 via-blue-400/20 to-blue-300/10 rounded-full shadow-xl transform -rotate-12 blur-[64px]"></div>
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-400/30 via-blue-500/20 to-blue-600/10 rounded-full shadow-xl transform rotate-12 blur-[64px]"></div>
        <div className="relative">
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-blue-600/5 via-blue-500/5 to-blue-400/5 backdrop-blur-xl border border-white/10 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-blue-500/10 to-blue-400/10 rounded-2xl blur-md opacity-50"></div>
            <svg className="relative w-16 h-16 mx-auto text-blue-500 transform hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        <h2 className={`mt-8 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
          theme === 'dark' 
            ? 'from-blue-400 to-blue-600' 
            : 'from-blue-600 to-blue-800'
        } drop-shadow-sm`}>
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
  );
}