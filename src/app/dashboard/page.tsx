'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [credit, setCredit] = useState(0);
  const [totalApprovals, setTotalApprovals] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Kredi bilgisini al
        const creditResponse = await fetch('/api/users/me');
        const creditData = await creditResponse.json();
        
        if (creditResponse.ok) {
          setCredit(creditData.credit);
          await update({ ...session, user: { ...session?.user, credit: creditData.credit } });
        }

        // Onay sayısını al
        const approvalsResponse = await fetch('/api/approvals/count');
        const approvalsData = await approvalsResponse.json();
        
        if (approvalsResponse.ok) {
          setTotalApprovals(approvalsData.count);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    } else {
      router.push('/auth/login');
    }
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
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
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        {credit}
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
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Toplam Onay
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {totalApprovals}
                      </div>
                      <div className="ml-2">
                        <span className="text-sm font-medium text-gray-500">adet</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
              <div className="text-sm">
                <Link href="/dashboard/approvals/history" className="font-medium text-blue-500 hover:text-blue-600">
                  Onay Geçmişi
                </Link>
              </div>
            </div>
          </div>

          {/* Son İşlem */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Son İşlem
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        -
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
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
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Hızlı İşlemler
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Sık kullanılan işlemlere hızlıca erişin.
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4">
                <Link href="/dashboard/approvals/new" className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Yeni Onay Al
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        IID numarası ile hızlıca onay alın.
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/credits/add" className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        Kredi Yükle
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
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