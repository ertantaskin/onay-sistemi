'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ArrowRightIcon, CreditCardIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { usePageContent } from '@/hooks/usePageContent';

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/login');
    },
  });
  
  const { pageContent, isLoading: pageLoading } = usePageContent("dashboard");
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    credits: 0,
    totalApprovals: 0,
    lastTransaction: null
  });
  const [loading, setLoading] = useState(true);

  // Sayfa başlığı ve açıklaması için varsayılan değerler
  const pageTitle = pageContent?.metaTitle || "Kontrol Paneli - Microsoft Onay Sistemi";
  const pageDescription = pageContent?.metaDesc || "Microsoft Onay Sistemi kullanıcı kontrol paneli. Kredi bakiyenizi görüntüleyin ve onay işlemlerinizi takip edin.";

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
  }, [pageTitle, pageDescription]);

  // Kullanıcı verilerini getir
  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading' || !session) return;
      
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini getir
        const userResponse = await fetch('/api/users/me');
        if (!userResponse.ok) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        const userDataResponse = await userResponse.json();
        const userData = userDataResponse.user;
        
        if (!userData) {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        // Onay sayısını getir
        let approvalCount = 0;
        try {
          const approvalsResponse = await fetch('/api/approvals/count');
          if (approvalsResponse.ok) {
            const approvalsData = await approvalsResponse.json();
            approvalCount = approvalsData.count || 0;
          }
        } catch (approvalError) {
          console.error('Onay sayısı alınırken hata:', approvalError);
        }
        
        // Son işlemi getir
        let lastTransaction = null;
        try {
          const transactionsResponse = await fetch('/api/credits/transactions/latest');
          if (transactionsResponse.ok) {
            const transactionData = await transactionsResponse.json();
            lastTransaction = transactionData.transaction;
          }
        } catch (transactionError) {
          console.error('Son işlem alınırken hata:', transactionError);
        }
        
        setUserData({
          name: userData.name || '',
          email: userData.email || '',
          credits: userData.credits || 0,
          totalApprovals: approvalCount,
          lastTransaction: lastTransaction
        });
      } catch (error) {
        console.error('Kullanıcı verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session, status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      deposit: 'Yükleme',
      usage: 'Kullanım',
      coupon: 'Kupon',
      refund: 'İade'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Onay Al */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Onay Al</h2>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                IID numaranızı girerek hemen onay numaranızı alabilirsiniz.
              </p>
              <Link
                href="/dashboard/approvals/new"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Onay Al
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Kredi Yükle */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kredi Yükle</h2>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Kredi kartı veya kupon kodu ile hesabınıza kredi yükleyebilirsiniz.
              </p>
              <Link
                href="/dashboard/credits/add"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Kredi Yükle
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Onay Geçmişi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Onay Geçmişi</h2>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Geçmiş onay işlemlerinizi görüntüleyebilirsiniz.
              </p>
              <Link
                href="/dashboard/approvals/history"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Geçmişi Görüntüle
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Kredi Bilgisi */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kredi Bilgisi</h2>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Mevcut Krediniz</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{userData.credits} Kredi</p>
              </div>
              <Link
                href="/dashboard/credits/history"
                className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
              >
                Kredi Geçmişi
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 