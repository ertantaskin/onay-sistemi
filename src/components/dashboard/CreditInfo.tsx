import { useState, useEffect } from 'react';
import { useTheme } from '@/app/ThemeContext';
import { useCreditStore } from '@/store/creditStore';
import Link from 'next/link';
import { CurrencyDollarIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

export function CreditInfo() {
  const { theme } = useTheme();
  const { credit } = useCreditStore();
  const [recentTransactions, setRecentTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch('/api/credits/history?page=1&limit=3');
      const data = await response.json();
      
      if (response.ok) {
        setRecentTransactions(data.transactions);
      }
    } catch (error) {
      console.error('Son işlemler alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'purchase': return 'Satın Alma';
      case 'coupon': return 'Kupon';
      case 'refund': return 'İade';
      case 'usage': return 'Kullanım';
      default: return type;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 mt-8`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Kredi Bilgisi
        </h2>
        <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
          <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-1">Mevcut Krediniz</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{credit} Kredi</p>
        </div>
        <Link
          href="/dashboard/credits/history"
          className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
        >
          Kredi Geçmişi
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Link>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Son İşlemler
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-center py-4 text-gray-600 dark:text-gray-400">
            Henüz işlem geçmişiniz bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                    {getTransactionTypeText(transaction.type)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(transaction.createdAt)}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  transaction.type === 'usage'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }`}>
                  {transaction.type === 'usage' ? '-' : '+'}{transaction.amount} Kredi
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 