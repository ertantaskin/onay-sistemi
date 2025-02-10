import { useState, useEffect } from 'react';
import { useTheme } from '@/app/ThemeContext';
import toast from 'react-hot-toast';

interface Approval {
  id: string;
  confirmationNumber: string;
  iidNumber: string;
  status: string;
  createdAt: string;
}

export function RecentApprovals() {
  const { theme } = useTheme();
  const [recentApprovals, setRecentApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentApprovals();
  }, []);

  const fetchRecentApprovals = async () => {
    try {
      const response = await fetch('/api/approvals/history?page=1&limit=10');
      const data = await response.json();
      
      if (response.ok) {
        setRecentApprovals(data.approvals);
      }
    } catch (error) {
      console.error('Son onaylar alınamadı:', error);
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Onay numarası kopyalandı!');
    } catch {
      toast.error('Kopyalama başarısız oldu');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mt-8`}>
      <h2 className={`text-xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Son Onay İşlemleri
      </h2>
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Tarih
                </th>
                <th scope="col" className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider hidden sm:table-cell`}>
                  Onay Numarası
                </th>
                <th scope="col" className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Durum
                </th>
                <th scope="col" className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} divide-y divide-gray-200 dark:divide-gray-700`}>
              {recentApprovals.length === 0 ? (
                <tr>
                  <td colSpan={4} className={`px-3 sm:px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Henüz onay işlemi bulunmuyor.
                  </td>
                </tr>
              ) : (
                recentApprovals.map((approval) => (
                  <tr key={approval.id} className={`${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatDate(approval.createdAt)}
                    </td>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono hidden sm:table-cell ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {approval.confirmationNumber}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        approval.status === 'completed' || approval.status === 'success'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : approval.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}>
                        {approval.status === 'completed' || approval.status === 'success' ? 'Tamamlandı'
                          : approval.status === 'pending' ? 'Bekliyor'
                          : 'Başarısız'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleCopy(approval.confirmationNumber)}
                        className={`inline-flex items-center p-1.5 rounded-lg transition-all duration-200 ${
                          theme === 'dark'
                            ? 'text-blue-400 hover:bg-gray-700 hover:text-blue-300'
                            : 'text-blue-600 hover:bg-gray-100 hover:text-blue-700'
                        }`}
                        title="Kopyala"
                      >
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span className="sr-only">Kopyala</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 