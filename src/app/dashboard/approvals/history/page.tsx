'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import toast from 'react-hot-toast';

interface Approval {
  id: string;
  confirmationNumber: string;
  iidNumber: string;
  status: string;
  createdAt: string;
}

export default function ApprovalHistoryPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchApprovals();
  }, [session, sessionStatus, page]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Onay geçmişi getiriliyor...');
      const response = await fetch(`/api/approvals/history?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Onay geçmişi alınamadı.');
      }

      console.log('Gelen veriler:', data);
      setApprovals(data.approvals);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error('Veri getirme hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bir hata oluştu.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Kopyalandı!');
    } catch (error) {
      toast.error('Kopyalama başarısız oldu');
    }
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className={`${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'} p-4 rounded-xl text-center`}>
          <p className={`text-lg ${theme === 'dark' ? 'text-red-200' : 'text-red-800'}`}>
            {error}
          </p>
          <button
            onClick={fetchApprovals}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Onay Geçmişi
            </h1>
            <button
              onClick={() => router.push('/dashboard/approvals/new')}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Yeni Onay Al
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Yükleniyor...</p>
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-8 text-center">
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Henüz onay geçmişiniz bulunmuyor.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Onay Numarası
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      IID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  {approvals.map((approval) => (
                    <tr key={approval.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {formatDate(approval.createdAt)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {approval.confirmationNumber}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {approval.iidNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          approval.status === 'success'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {approval.status === 'success' ? 'Başarılı' : 'Başarısız'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleCopy(approval.confirmationNumber)}
                          className="text-blue-500 hover:text-blue-600 focus:outline-none"
                          title="Onay Numarasını Kopyala"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Önceki
                </button>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Sayfa {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    page === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Sonraki
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 