'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  ArrowPathIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  NoSymbolIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch('/api/admin/payment-methods');
      if (!response.ok) throw new Error('Ödeme yöntemleri yüklenemedi');
      const data = await response.json();
      setPaymentMethods(data);
    } catch (error) {
      toast.error('Ödeme yöntemleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) throw new Error('Ödeme yöntemi eklenemedi');

      await loadPaymentMethods();
      resetForm();
      toast.success('Ödeme yöntemi başarıyla eklendi');
    } catch (error) {
      toast.error('Ödeme yöntemi eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingId(method.id);
    setName(method.name);
    setDescription(method.description || '');
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setLoading(true);

    try {
      const response = await fetch('/api/admin/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          name,
          description,
        }),
      });

      if (!response.ok) throw new Error('Ödeme yöntemi güncellenemedi');

      await loadPaymentMethods();
      resetForm();
      toast.success('Ödeme yöntemi başarıyla güncellendi');
    } catch (error) {
      toast.error('Ödeme yöntemi güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinizden emin misiniz?')) return;
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/payment-methods/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Ödeme yöntemi silinemedi');

      await loadPaymentMethods();
      toast.success('Ödeme yöntemi başarıyla silindi');
    } catch (error) {
      toast.error('Ödeme yöntemi silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setLoading(true);

    try {
      const response = await fetch('/api/admin/payment-methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });

      if (!response.ok) throw new Error('Durum güncellenemedi');

      await loadPaymentMethods();
      toast.success('Durum başarıyla güncellendi');
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
  };

  if (loading && paymentMethods.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Ödeme Yöntemleri</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tüm ödeme yöntemlerini görüntüleyin ve yönetin
          </p>
        </div>
        <button
          onClick={() => {
            setRefreshing(true);
            loadPaymentMethods();
          }}
          disabled={refreshing}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
        >
          <ArrowPathIcon className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Yenileniyor...' : 'Yenile'}
        </button>
      </div>

      {/* Yeni Ödeme Yöntemi Ekleme Formu */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center mb-8">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <CreditCardIcon className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? 'Ödeme Yöntemi Düzenle' : 'Yeni Ödeme Yöntemi Ekle'}
            </h2>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              {editingId ? 'Ödeme yöntemini güncelleyin' : 'Yeni bir ödeme yöntemi ekleyin'}
            </p>
          </div>
        </div>

        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ödeme Yöntemi Adı
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Açıklama
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-12 px-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white hover:bg-white transition-all text-[15px] font-medium shadow-sm"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                İptal
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {editingId ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </form>
      </div>

      {/* Ödeme Yöntemleri Listesi */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ödeme Yöntemi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Açıklama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentMethods.map((method) => (
                <tr key={method.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {method.name[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{method.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {method.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(method.id, method.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        method.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {method.isActive ? (
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                      ) : (
                        <NoSymbolIcon className="w-4 h-4 mr-1" />
                      )}
                      {method.isActive ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => handleEdit(method)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Düzenle"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Sil"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 