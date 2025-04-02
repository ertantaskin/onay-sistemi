'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/ThemeContext';
import { useCreditStore } from '@/store/creditStore';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import { 
  Wallet, 
  ArrowRight, 
  History, 
  ArrowLeft, 
  Coins, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  CreditCard,
  Tag
} from "lucide-react";

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'coupon' | 'refund' | 'usage' | 'PURCHASE';
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  description: string;
  createdAt: string;
}

export default function CreditHistoryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const { credits } = useCreditStore();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (sessionStatus === 'authenticated') {
      fetchTransactions();
    }
  }, [sessionStatus, page]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/credits/history?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'İşlem geçmişi alınamadı.');
      }

      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'purchase': return 'Satın Alma';
      case 'PURCHASE': return 'Satın Alma';
      case 'coupon': return 'Kupon';
      case 'refund': return 'İade';
      case 'usage': return 'Kullanım';
      default: return type;
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'PURCHASE': 
        return <CreditCard className="h-4 w-4 mr-1.5" />;
      case 'coupon': 
        return <Tag className="h-4 w-4 mr-1.5" />;
      case 'refund': 
        return <RefreshCw className="h-4 w-4 mr-1.5" />;
      case 'usage': 
        return <Coins className="h-4 w-4 mr-1.5" />;
      default: 
        return <Coins className="h-4 w-4 mr-1.5" />;
    }
  }; 

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return theme === 'dark' 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-green-100 text-green-800';
      case 'pending':
        return theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return theme === 'dark' 
          ? 'bg-red-900/30 text-red-400' 
          : 'bg-red-100 text-red-800';
      default:
        return theme === 'dark' 
          ? 'bg-gray-900/30 text-gray-400' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1.5" />;
      case 'failed':
        return <XCircle className="h-4 w-4 mr-1.5" />;
      default:
        return <Clock className="h-4 w-4 mr-1.5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Bekliyor';
      case 'failed': return 'Başarısız';
      default: return status;
    }
  };

  if (loading && sessionStatus !== 'loading') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Kredi geçmişi yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <Toaster position="top-center" />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Sayfa Başlığı */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <History className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kredi Geçmişi</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Tüm kredi işlemlerinizi görüntüleyin
              </p>
            </div>
          </div>
        </div>

        {/* Geri Dön Butonu */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard/credits')}
            className={`flex items-center text-sm ${
              theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
            } transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kredi İşlemlerine Geri Dön
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Kredi Geçmişi */}
          <div className="lg:col-span-9 space-y-6">
            {/* Kredi Bilgisi */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-lg font-semibold">Kredi Bilgisi</h2>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mb-1`}>Mevcut Krediniz</p>
                    <div className="text-3xl font-bold">
                      {credits} <span className="text-yellow-500">Kredi</span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/credits/add"
                    className={`inline-flex items-center px-4 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-yellow-600 hover:bg-yellow-700' 
                        : 'bg-yellow-500 hover:bg-yellow-600'
                    } text-white font-medium transition-colors duration-200`}
                  >
                    Kredi Yükle
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Kredi Geçmişi Tablosu */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">İşlem Geçmişi</h2>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                {transactions.length === 0 ? (
                  <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Coins className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Henüz işlem geçmişiniz bulunmuyor.</p>
                  </div>
                ) : (
                  <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead className={theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          İşlem Türü
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Miktar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Açıklama
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className={theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {formatDate(transaction.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              {getTransactionTypeIcon(transaction.type)}
                              {getTransactionTypeText(transaction.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={transaction.type === 'usage' || transaction.type === 'PURCHASE' || transaction.amount < 0 
                              ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                              : theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
                              {transaction.amount < 0 ? '' : '+'}{transaction.amount} Kredi
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(transaction.status)}`}>
                              {getStatusIcon(transaction.status)}
                              {getStatusText(transaction.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {transaction.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center p-6 space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                    } transition-colors disabled:cursor-not-allowed`}
                  >
                    Önceki
                  </button>
                  <span className={`px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sayfa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
                    } transition-colors disabled:cursor-not-allowed`}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 