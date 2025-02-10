'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useCreditStore } from '@/store/creditStore';

const creditOptions = [
  { value: 100, label: '100 Kredi', price: '50 TL' },
  { value: 200, label: '200 Kredi', price: '95 TL' },
  { value: 500, label: '500 Kredi', price: '225 TL' },
  { value: 1000, label: '1000 Kredi', price: '400 TL' },
];

export default function AddCreditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [couponCode, setCouponCode] = useState('');
  const { updateCredit } = useCreditStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit && paymentMethod === 'credit_card') {
      toast.error('Lütfen bir kredi paketi seçin.');
      return;
    }

    if (paymentMethod === 'coupon' && !couponCode) {
      toast.error('Lütfen kupon kodunu girin.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedCredit,
          paymentMethod,
          couponCode: paymentMethod === 'coupon' ? couponCode : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kredi yükleme işlemi başarısız oldu.');
      }

      await updateCredit();
      
      toast.success('Kredi yükleme işlemi başarılı!');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Kredi Yükle
          </h1>

          <div className="mb-8">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <CreditCardIcon className="h-6 w-6 text-blue-500" />
                <span className="text-gray-900 dark:text-white font-medium">Kredi Kartı</span>
              </button>
              <button
                onClick={() => setPaymentMethod('coupon')}
                className={`flex-1 flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                  paymentMethod === 'coupon'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <GiftIcon className="h-6 w-6 text-purple-500" />
                <span className="text-gray-900 dark:text-white font-medium">Kupon Kodu</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {paymentMethod === 'credit_card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {creditOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedCredit(option.value)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedCredit === option.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                    }`}
                  >
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {option.price}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mb-8">
                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kupon Kodu
                </label>
                <input
                  type="text"
                  id="couponCode"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
                  placeholder="Kupon kodunuzu girin"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (paymentMethod === 'credit_card' && !selectedCredit) || (paymentMethod === 'coupon' && !couponCode)}
              className="w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 