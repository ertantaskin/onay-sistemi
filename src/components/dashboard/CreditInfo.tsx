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
        const loadingTransactions = data.transactions.filter(
          (t: CreditTransaction) => ['purchase', 'coupon', 'deposit'].includes(t.type)
        ).slice(0, 3);
        setRecentTransactions(loadingTransactions);
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
      case 'purchase': return 'Kredi Kartı ile Yükleme';
      case 'coupon': return 'Kupon ile Yükleme';
      case 'deposit': return 'Bakiye Yükleme';
      default: return type;
    }
  };

  const scrollToAddCredit = () => {
    const addCreditSection = document.getElementById('add-credit-section');
    if (addCreditSection) {
      addCreditSection.scrollIntoView({ behavior: 'smooth' });
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
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{credit} Kredi</p>
            <button
              onClick={scrollToAddCredit}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Kredi Yükle
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
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
          Son 3 Kredi Yükleme İşlemi
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-center py-4 text-gray-600 dark:text-gray-400">
            Henüz kredi yükleme işlemi bulunmuyor.
          </p>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700/50 hover:bg-gray-700' 
                    : 'bg-gray-50 hover:bg-gray-100'
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
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  +{transaction.amount} Kredi
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 