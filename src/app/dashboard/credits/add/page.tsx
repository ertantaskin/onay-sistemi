'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import toast from 'react-hot-toast';

const creditOptions = [
  { value: 100, label: '100 Kredi', price: '50 TL' },
  { value: 200, label: '200 Kredi', price: '95 TL' },
  { value: 500, label: '500 Kredi', price: '225 TL' },
  { value: 1000, label: '1000 Kredi', price: '400 TL' },
];

export default function AddCreditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCredit) {
      toast.error('Lütfen bir kredi paketi seçin.');
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kredi yükleme işlemi başarısız oldu.');
      }

      toast.success('Kredi başarıyla yüklendi!');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Kredi Yükle
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-4 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Kredi Paketi Seçin
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creditOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => setSelectedCredit(option.value)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedCredit === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {option.label}
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {option.price}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border ${
                      selectedCredit === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : theme === 'dark'
                        ? 'border-gray-600'
                        : 'border-gray-300'
                    }`}>
                      {selectedCredit === option.value && (
                        <div className="w-2 h-2 m-1 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
              Ödeme Yöntemi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-4 rounded-lg border-2 text-left ${
                  paymentMethod === 'credit_card'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : theme === 'dark'
                    ? 'border-gray-700'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'credit_card'
                      ? 'border-blue-500 bg-blue-500'
                      : theme === 'dark'
                      ? 'border-gray-600'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'credit_card' && (
                      <div className="w-2 h-2 m-1 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Kredi Kartı
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Güvenli ödeme
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-4 rounded-lg border-2 text-left ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : theme === 'dark'
                    ? 'border-gray-700'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border ${
                    paymentMethod === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-500'
                      : theme === 'dark'
                      ? 'border-gray-600'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'bank_transfer' && (
                      <div className="w-2 h-2 m-1 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Havale/EFT
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Banka transferi
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                theme === 'dark'
                  ? 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Geri
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCredit}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                loading || !selectedCredit
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  İşleniyor...
                </div>
              ) : (
                'Ödemeye Geç'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 