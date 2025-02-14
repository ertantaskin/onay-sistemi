'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiOutlineTicket, HiOutlineSearch, HiOutlineRefresh, HiOutlinePlus, HiOutlineTrash, HiOutlineClock, HiOutlineChartBar, HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineFilter, HiOutlineX, HiOutlineCheck, HiOutlineInformationCircle } from 'react-icons/hi';

interface CouponUsage {
  id: string;
  userId: string;
  creditAmount: number;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

interface Coupon {
  id: string;
  code: string;
  value: number;
  minAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  usages?: CouponUsage[];
}

type FilterStatus = 'all' | 'active' | 'expired' | 'used' | 'inactive';

export default function AdminCouponsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    value: 0,
    minAmount: 0,
    maxUses: 1,
    expiresAt: ''
  });
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons?includeUsages=true');
      if (!response.ok) throw new Error('Kuponlar yüklenemedi');
      const data = await response.json();
      setCoupons(data);
      applyFilters(data, searchQuery, filterStatus);
    } catch (error) {
      toast.error('Kuponlar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (couponsData: Coupon[], search: string, status: FilterStatus) => {
    let filtered = [...couponsData];

    // Arama filtresi
    if (search) {
      filtered = filtered.filter(coupon => 
        coupon.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Durum filtresi
    switch (status) {
      case 'active':
        filtered = filtered.filter(coupon => 
          coupon.isActive && !isExpired(coupon.expiresAt) && !isUsedUp(coupon)
        );
        break;
      case 'expired':
        filtered = filtered.filter(coupon => 
          isExpired(coupon.expiresAt)
        );
        break;
      case 'used':
        filtered = filtered.filter(coupon => 
          isUsedUp(coupon)
        );
        break;
      case 'inactive':
        filtered = filtered.filter(coupon => 
          !coupon.isActive
        );
        break;
    }

    setFilteredCoupons(filtered);
  };

  useEffect(() => {
    loadCoupons();
  }, [searchQuery]);

  useEffect(() => {
    applyFilters(coupons, searchQuery, filterStatus);
  }, [filterStatus]);

  const handleRefresh = () => {
    setLoading(true);
    loadCoupons();
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    applyFilters(coupons, value, filterStatus);
  };

  const handleFilterChange = (status: FilterStatus) => {
    setFilterStatus(status);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    applyFilters(coupons, '', 'all');
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCoupon(prev => ({ ...prev, code }));
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Kupon oluşturulamadı');
      }

      toast.success('Kupon başarıyla oluşturuldu');
      setShowCreateModal(false);
      setNewCoupon({
        code: '',
        value: 0,
        minAmount: 0,
        maxUses: 1,
        expiresAt: ''
      });
      handleRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu');
    }
  };

  const handleUpdateCoupon = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: couponId, isActive }),
      });

      if (!response.ok) throw new Error('Kupon güncellenemedi');
      
      toast.success('Kupon durumu güncellendi');
      handleRefresh();
    } catch (error) {
      toast.error('Kupon güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!window.confirm('Bu kuponu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Kupon silinemedi');
      
      toast.success('Kupon başarıyla silindi');
      handleRefresh();
    } catch (error) {
      console.error('Silme hatası:', error);
      toast.error('Kupon silinirken bir hata oluştu');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isUsedUp = (coupon: Coupon) => {
    return coupon.usedCount >= coupon.maxUses;
  };

  // Kupon istatistikleri
  const getStats = () => {
    const totalCoupons = coupons.length;
    const activeCoupons = coupons.filter(c => c.isActive && !isExpired(c.expiresAt) && !isUsedUp(c)).length;
    const totalUsage = coupons.reduce((sum, c) => sum + c.usedCount, 0);
    const totalValue = coupons.reduce((sum, c) => sum + (c.value * c.usedCount), 0);

    return { totalCoupons, activeCoupons, totalUsage, totalValue };
  };

  const handleShowUsageDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowUsageModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Başlık ve Açıklama */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 shadow-lg">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-2">
            Kupon Yönetimi
          </h1>
          <p className="text-blue-100 text-lg max-w-3xl">
            Kampanyalarınızı yönetin, kupon kodları oluşturun ve kullanım istatistiklerini takip edin. 
            Özel indirimler ve promosyonlar için güçlü bir kupon sistemi.
          </p>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <HiOutlineTicket className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">
              Toplam
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalCoupons}</p>
          <p className="text-white/80 text-sm">Toplam Kupon</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <HiOutlineChartBar className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">
              Aktif
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.activeCoupons}</p>
          <p className="text-white/80 text-sm">Aktif Kupon</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <HiOutlineUsers className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">
              Kullanım
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalUsage}</p>
          <p className="text-white/80 text-sm">Toplam Kullanım</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <HiOutlineCurrencyDollar className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium bg-white/20 px-2.5 py-1 rounded-full">
              Değer
            </span>
          </div>
          <p className="text-2xl font-bold">{stats.totalValue}</p>
          <p className="text-white/80 text-sm">Toplam Kredi Değeri</p>
        </div>
      </div>

      {/* Başlık ve Kontroller */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 text-gray-500 hover:text-blue-600 bg-white dark:bg-gray-800 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200 group relative"
            title="Listeyi Yenile"
          >
            <HiOutlineRefresh className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" />
            <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Listeyi Yenile
            </span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 group"
          >
            <HiOutlinePlus className="w-5 h-5 mr-2 transform group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-medium">Yeni Kupon Oluştur</span>
          </button>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 space-y-4">
          {/* Arama */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HiOutlineSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Kupon kodu ara..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
            />
          </div>

          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <HiOutlineFilter className="w-5 h-5" />
              <span>Filtrele:</span>
            </div>
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'active', label: 'Aktif' },
              { value: 'expired', label: 'Süresi Dolmuş' },
              { value: 'used', label: 'Tükenmiş' },
              { value: 'inactive', label: 'Pasif' },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => handleFilterChange(status.value as FilterStatus)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === status.value
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.label}
              </button>
            ))}
            {(searchQuery || filterStatus !== 'all') && (
              <button
                onClick={clearFilters}
                className="flex items-center px-3 py-1 rounded-full text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/50 dark:hover:bg-red-900"
              >
                <HiOutlineX className="w-4 h-4 mr-1" />
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kupon Listesi */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kupon Kodu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Değer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Kullanım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Son Kullanım
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Filtrelere uygun kupon bulunamadı'
                      : 'Henüz kupon bulunmuyor'}
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {coupon.value} Kredi
                      {coupon.minAmount > 0 && (
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                          (Min: {coupon.minAmount} kredi)
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {coupon.usedCount} / {coupon.maxUses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        isExpired(coupon.expiresAt)
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : isUsedUp(coupon)
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          : coupon.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {isExpired(coupon.expiresAt)
                          ? 'Süresi Dolmuş'
                          : isUsedUp(coupon)
                          ? 'Tükenmiş'
                          : coupon.isActive
                          ? 'Aktif'
                          : 'Pasif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleShowUsageDetails(coupon)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Detaylar"
                      >
                        <HiOutlineInformationCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleUpdateCoupon(coupon.id, !coupon.isActive)}
                        className={`${
                          coupon.isActive
                            ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                            : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                        } transition-colors`}
                        title={coupon.isActive ? 'Pasife Al' : 'Aktife Al'}
                      >
                        {coupon.isActive ? (
                          <HiOutlineX className="w-5 h-5" />
                        ) : (
                          <HiOutlineCheck className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Sil"
                      >
                        <HiOutlineTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yeni Kupon Oluşturma Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateCoupon}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                        Yeni Kupon Oluştur
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kupon Kodu
                          </label>
                          <div className="mt-1 flex rounded-md shadow-sm">
                            <input
                              type="text"
                              value={newCoupon.code}
                              onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="WELCOME2024"
                            />
                            <button
                              type="button"
                              onClick={generateCouponCode}
                              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-r-md hover:bg-gray-100 dark:hover:bg-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              Oluştur
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Kredi Değeri
                          </label>
                          <input
                            type="number"
                            value={newCoupon.value}
                            onChange={(e) => setNewCoupon(prev => ({ ...prev, value: parseInt(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Minimum Kredi Şartı
                          </label>
                          <input
                            type="number"
                            value={newCoupon.minAmount}
                            onChange={(e) => setNewCoupon(prev => ({ ...prev, minAmount: parseInt(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Maksimum Kullanım
                          </label>
                          <input
                            type="number"
                            value={newCoupon.maxUses}
                            onChange={(e) => setNewCoupon(prev => ({ ...prev, maxUses: parseInt(e.target.value) }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Son Kullanım Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            value={newCoupon.expiresAt}
                            onChange={(e) => setNewCoupon(prev => ({ ...prev, expiresAt: e.target.value }))}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Oluştur
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kupon Kullanım Detayları Modal */}
      {showUsageModal && selectedCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kupon Kullanım Detayları
                </h3>
                <button
                  onClick={() => setShowUsageModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
              <div className="mt-2 space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Kupon Kodu: <span className="font-medium">{selectedCoupon.code}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Değer: <span className="font-medium">{selectedCoupon.value} Kredi</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Kullanım: <span className="font-medium">{selectedCoupon.usedCount} / {selectedCoupon.maxUses}</span>
                </p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Kullanım Geçmişi
              </h4>
              {selectedCoupon.usages && selectedCoupon.usages.length > 0 ? (
                <div className="space-y-4">
                  {selectedCoupon.usages.map((usage) => (
                    <div
                      key={usage.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {usage.user.name || usage.user.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(usage.createdAt)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">
                          +{usage.creditAmount} Kredi
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  Bu kupon henüz kullanılmamış.
                </p>
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={() => setShowUsageModal(false)}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 