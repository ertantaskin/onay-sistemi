'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import { useCreditStore } from '@/store/creditStore';
import {
  ClipboardCopy,
  CreditCard,
  DollarSign,
  CheckCircle,
  History,
  ChevronRight,
  ArrowLeft,
  ArrowRight
} from "lucide-react";

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
  const { credits } = useCreditStore();
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
      
      const response = await fetch(`/api/approvals/history?page=${page}&limit=10`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Onay geçmişi alınamadı.');
      }

      setApprovals(data.approvals);
      setTotalPages(Math.ceil(data.total / 10));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu.');
      toast.error('Onay geçmişi alınamadı.');
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

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Kopyalandı!');
    } catch (err) {
      toast.error('Kopyalama başarısız oldu.');
    }
  };

  if (loading && sessionStatus !== 'loading') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Onay geçmişiniz yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster position="top-center" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <div className={`text-red-500 mb-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20' : 'bg-red-50'}`}>
            {error}
          </div>
          <button
            onClick={() => fetchApprovals()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tekrar Dene
          </button>
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
              <h1 className="text-3xl font-bold">Onay Geçmişi</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Geçmiş onay işlemlerinizi görüntüleyin ve yönetin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Kredi Bilgisi ve Onay Geçmişi */}
          <div className="lg:col-span-9 space-y-8">
            {/* Üst Bilgi Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Kredi Bilgisi */}
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Kredi Bilgisi</h2>
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-yellow-900/20' : 'bg-yellow-100'
                  }`}>
                    <DollarSign className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-1`}>Mevcut Krediniz</p>
                <p className="text-3xl font-bold">{credits} Kredi</p>
              </div>

              {/* Kredi Yükle */}
              <Link
                href="/dashboard/credits/add"
                className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg p-6 transition-all duration-200 block`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Kredi Yükle</h2>
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
                  }`}>
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  Kredi kartı veya kupon kodu ile hesabınıza kredi yükleyin
                </p>
                <span className={`inline-flex items-center ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} group`}>
                  Kredi Yükle
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>

              {/* Onay Numarası Al */}
              <Link
                href="/dashboard/approvals/new"
                className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} shadow-lg p-6 transition-all duration-200 block`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Onay Numarası Al</h2>
                  <div className={`p-2 rounded-full ${
                    theme === 'dark' ? 'bg-green-900/20' : 'bg-green-100'
                  }`}>
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  IID numaranızı girerek hemen onay numaranızı alın
                </p>
                <span className={`inline-flex items-center ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} group`}>
                  Onay Al
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                </span>
              </Link>
            </div>

            {/* Onay Geçmişi */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold flex items-center`}>
                  <History className="h-5 w-5 mr-2 text-blue-500" />
                  Onay Geçmişi
                </h2>
              </div>
              
              <div className="p-6">
                {approvals.length === 0 ? (
                  <div className="text-center py-10">
                    <History className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-lg`}>
                      Henüz onay geçmişiniz bulunmuyor.
                    </p>
                    <Link
                      href="/dashboard/approvals/new"
                      className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                      } transition-colors duration-200`}
                    >
                      Yeni Onay Al
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Tarih
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Onay Numarası
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            IID Numarası
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                            Durum
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {approvals.map((approval) => (
                          <tr key={approval.id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {formatDate(approval.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-2">
                                <span>{approval.confirmationNumber}</span>
                                <button
                                  onClick={() => handleCopy(approval.confirmationNumber)}
                                  className={`${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} transition-colors duration-150`}
                                  title="Kopyala"
                                >
                                  <ClipboardCopy className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className="font-mono">{approval.iidNumber.substring(0, 16)}...</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                approval.status === 'completed' || approval.status === 'success'
                                  ? theme === 'dark' 
                                    ? 'bg-green-900/30 text-green-400' 
                                    : 'bg-green-100 text-green-800'
                                  : approval.status === 'pending'
                                  ? theme === 'dark' 
                                    ? 'bg-yellow-900/30 text-yellow-400' 
                                    : 'bg-yellow-100 text-yellow-800'
                                  : theme === 'dark' 
                                    ? 'bg-red-900/30 text-red-400' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {approval.status === 'completed' || approval.status === 'success' ? 'Tamamlandı'
                                  : approval.status === 'pending' ? 'Bekliyor'
                                  : 'Başarısız'}
                              </span>
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
                      className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Önceki
                    </button>
                    <span className={`px-4 py-2 text-sm ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sayfa {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className={`flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                        theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Sonraki
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 