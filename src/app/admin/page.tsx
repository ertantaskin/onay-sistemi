'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineCheckCircle, HiOutlineRefresh } from 'react-icons/hi';
import { HiMiniArrowTrendingUp, HiMiniArrowTrendingDown, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';

interface Stats {
  totalUsers: number;
  totalCredits: number;
  totalApprovals: number;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    createdAt: string;
    user: {
      email: string;
    };
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) throw new Error('Stats yüklenemedi');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('İstatistikler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Sayfalandırılmış işlemler
  const paginatedTransactions = stats?.recentTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  const totalPages = stats ? Math.ceil(stats.recentTransactions.length / itemsPerPage) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-sm p-8">
        <HiOutlineRefresh className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          İstatistikler Yüklenemedi
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık ve Yenile Butonu */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Sistemin genel durumunu ve son işlemleri görüntüleyin
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <HiOutlineRefresh className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-lg">
              <HiOutlineUsers className="h-8 w-8" />
            </div>
            <span className="flex items-center text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-lg">
              <HiMiniArrowTrendingUp className="w-4 h-4 mr-1" />
              12%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
            <p className="text-white/80 mt-1">Toplam Kullanıcı</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-lg">
              <HiOutlineCurrencyDollar className="h-8 w-8" />
            </div>
            <span className="flex items-center text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-lg">
              <HiMiniArrowTrendingUp className="w-4 h-4 mr-1" />
              8%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{stats.totalCredits}</p>
            <p className="text-white/80 mt-1">Toplam Kredi</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-full bg-white/20 backdrop-blur-lg">
              <HiOutlineCheckCircle className="h-8 w-8" />
            </div>
            <span className="flex items-center text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-lg">
              <HiMiniArrowTrendingDown className="w-4 h-4 mr-1" />
              3%
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold">{stats.totalApprovals}</p>
            <p className="text-white/80 mt-1">Toplam Onay</p>
          </div>
        </div>
      </div>

      {/* Son İşlemler */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">Son Kredi İşlemleri</h3>
          <p className="mt-1 text-sm text-gray-500">
            Son dönemde gerçekleşen kredi işlemleri
          </p>
        </div>
        <div className="divide-y divide-gray-100">
          {paginatedTransactions.length > 0 ? (
            paginatedTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.type === 'admin_add'
                        ? 'bg-blue-100 text-blue-600'
                        : transaction.type === 'usage'
                        ? 'bg-red-100 text-red-600'
                        : transaction.type === 'coupon'
                        ? 'bg-sky-100 text-sky-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <HiOutlineCurrencyDollar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.type === 'admin_add'
                        ? 'bg-blue-100 text-blue-800'
                        : transaction.type === 'usage'
                        ? 'bg-red-100 text-red-800'
                        : transaction.type === 'coupon'
                        ? 'bg-sky-100 text-sky-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {transaction.amount} Kredi
                    {transaction.type === 'admin_add' && ' (Admin)'}
                    {transaction.type === 'usage' && ' (Kullanım)'}
                    {transaction.type === 'coupon' && ' (Kupon)'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <HiOutlineCurrencyDollar className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">İşlem Yok</h3>
              <p className="mt-1 text-sm text-gray-500">
                Henüz hiç kredi işlemi gerçekleşmemiş.
              </p>
            </div>
          )}
        </div>

        {/* Sayfalandırma */}
        {stats && stats.recentTransactions.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Toplam {stats.recentTransactions.length} işlemden {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, stats.recentTransactions.length)} arası gösteriliyor
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 