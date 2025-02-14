'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { CurrencyDollarIcon, MagnifyingGlassIcon, ArrowPathIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useDebounce } from 'use-debounce';

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
}

interface CreditTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  note: string;
  createdAt: string;
  user: {
    email: string;
    name: string;
  };
}

export default function AdminCreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [debouncedUserSearch] = useDebounce(userSearchTerm, 300);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [addingCredit, setAddingCredit] = useState(false);

  // Kredi işlemlerini yükle
  const loadTransactions = async () => {
    try {
      const response = await fetch('/api/admin/credits');
      if (!response.ok) throw new Error('İşlemler yüklenemedi');
      const data = await response.json();
      setTransactions(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
    } catch (error) {
      toast.error('Kredi işlemleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Kullanıcı ara
  const searchUsers = async (search: string) => {
    if (!search) {
      setFilteredUsers([]);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('Kullanıcılar yüklenemedi');
      const data = await response.json();
      setFilteredUsers(data);
      setShowUserDropdown(true);
    } catch (error) {
      toast.error('Kullanıcılar aranırken bir hata oluştu');
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    searchUsers(debouncedUserSearch);
  }, [debouncedUserSearch]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setUserSearchTerm(user.email);
    setShowUserDropdown(false);
  };

  const handleAddCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !amount) {
      toast.error('Lütfen tüm alanları doldurun');
      return;
    }

    setAddingCredit(true);
    try {
      const response = await fetch('/api/admin/credits/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: parseInt(amount),
          note,
          type: 'admin_add',
        }),
      });

      if (!response.ok) throw new Error('Kredi eklenemedi');

      toast.success('Kredi başarıyla eklendi');
      setSelectedUser(null);
      setUserSearchTerm('');
      setAmount('');
      setNote('');
      loadTransactions();
    } catch (error) {
      toast.error('Kredi eklenirken bir hata oluştu');
    } finally {
      setAddingCredit(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

  const filteredTransactions = searchTerm
    ? transactions.filter(
        (t) =>
          t.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sayfa değiştirme fonksiyonu
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kredi İşlemleri</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kullanıcılara kredi ekleyin ve işlem geçmişini görüntüleyin
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Kredi Ekleme Formu */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-8">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <CurrencyDollarIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">Kredi Ekle</h2>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              Mail adresi ile kullanıcı arayıp kredi ekleyin
            </p>
          </div>
        </div>
        <form onSubmit={handleAddCredit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Kullanıcı Ara
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  onFocus={() => setShowUserDropdown(true)}
                  className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
                  placeholder="Mail adresi ile kullanıcı arayın..."
                />
                {selectedUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUser(null);
                      setUserSearchTerm('');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              {showUserDropdown && filteredUsers.length > 0 && !selectedUser && (
                <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-48 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleUserSelect(user)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                    >
                      <div className="text-sm font-medium text-gray-800">{user.email}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {user.name || 'İsimsiz'} • Mevcut Kredi: {user.credits}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Miktar
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
                placeholder="Eklenecek kredi miktarı..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Not
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
                placeholder="İşlem için açıklama..."
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedUser || !amount || addingCredit}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center"
            >
              {addingCredit ? (
                <>
                  <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Kredi Ekleniyor...
                </>
              ) : (
                'Kredi Ekle'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* İşlem Listesi */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800">Kredi İşlem Geçmişi</h3>
              <p className="mt-1 text-sm text-gray-500 font-medium">
                Tüm kredi işlemlerini görüntüleyin ve filtreleyebilirsiniz
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Mail, işlem tipi veya not ile arama yapın..."
                  className="w-full md:w-80 h-12 pl-11 pr-4 text-gray-700 placeholder:text-gray-400 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
                />
                <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Miktar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Not
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.user.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.user.name || 'İsimsiz'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'admin_add'
                            ? 'bg-blue-100 text-blue-800'
                            : transaction.type === 'usage'
                            ? 'bg-red-100 text-red-800'
                            : transaction.type === 'coupon'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {transaction.type === 'admin_add' && 'Admin Ekleme'}
                        {transaction.type === 'usage' && 'Kullanım'}
                        {transaction.type === 'coupon' && 'Kupon'}
                        {transaction.type === 'refund' && 'İade'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {transaction.amount} Kredi
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.note || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">İşlem Bulunamadı</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? 'Arama kriterlerine uygun işlem bulunamadı.'
                        : 'Henüz hiç kredi işlemi gerçekleşmemiş.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sayfalandırma */}
        {filteredTransactions.length > 0 && (
          <div className="px-6 py-4 bg-white border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Toplam {filteredTransactions.length} işlemden {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} arası gösteriliyor
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
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
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 