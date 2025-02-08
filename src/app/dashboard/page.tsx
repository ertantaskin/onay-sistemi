'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import Link from 'next/link';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Kredi Bakiyesi */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Kredi Bakiyesi
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {session.user?.credit || 0}
                      </div>
                      <div className="ml-2">
                        <span className="text-sm font-medium text-green-500">Kredi</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <Link href="/dashboard/credits/add" className="font-medium text-blue-500 hover:text-blue-600">
                  Kredi Yükle
                </Link>
              </div>
            </div>
          </div>

          {/* Toplam Onay */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Toplam Onay
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        0
                      </div>
                      <div className="ml-2">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>adet</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <Link href="/dashboard/approvals/history" className="font-medium text-blue-500 hover:text-blue-600">
                  Onay Geçmişi
                </Link>
              </div>
            </div>
          </div>

          {/* Son İşlem */}
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Son İşlem
                    </dt>
                    <dd className="flex items-baseline">
                      <div className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        -
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-3`}>
              <div className="text-sm">
                <Link href="/dashboard/credits/history" className="font-medium text-blue-500 hover:text-blue-600">
                  Tüm İşlemler
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Ana İçerik */}
        <div className="mt-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow overflow-hidden sm:rounded-lg`}>
            <div className="px-4 py-5 sm:px-6">
              <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Hızlı İşlemler
              </h3>
              <p className={`mt-1 max-w-2xl text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Sık kullanılan işlemlere hızlıca erişin.
              </p>
            </div>
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4">
                <Link 
                  href="/dashboard/approvals/new" 
                  className={`block p-4 rounded-lg border ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Yeni Onay Al
                      </h4>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        IID numarası ile hızlıca onay alın.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link 
                  href="/dashboard/credits/add" 
                  className={`block p-4 rounded-lg border ${
                    theme === 'dark' 
                      ? 'border-gray-700 hover:bg-gray-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Kredi Yükle
                      </h4>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Bakiyenizi hemen artırın.
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 