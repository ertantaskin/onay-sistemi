'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/app/ThemeContext';
import { useCreditStore } from '@/store/creditStore';

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
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const { credits } = useCreditStore();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [page]);

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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Kredi Bilgisi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kredi Bilgisi</h2>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Mevcut Krediniz</p>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {credits} Kredi
              </div>
            </div>
            <Link
              href="/dashboard/credits/add"
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Kredi Yükle
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Kredi Geçmişi */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mt-8">
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Kredi Geçmişi
            </h1>

            {transactions.length === 0 ? (
              <p className="text-center py-8 text-gray-600 dark:text-gray-400">
                Henüz işlem geçmişiniz bulunmuyor.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        İşlem
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Miktar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Açıklama
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getTransactionTypeText(transaction.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={transaction.type === 'usage' || transaction.type === 'PURCHASE' || transaction.amount < 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'}>
                            {transaction.amount < 0 ? '' : '+'}{transaction.amount} Kredi
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {transaction.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 