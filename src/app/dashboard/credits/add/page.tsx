'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline';
import { useCreditStore } from '@/store/creditStore';
import { CreditInfo } from '@/components/dashboard/CreditInfo';

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  isActive: boolean;
  paymentMethodId: string;
}

export default function AddCreditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const { updateCredits } = useCreditStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Ödeme yöntemlerini yükle
        const methodsResponse = await fetch('/api/payment-methods');
        const methodsData = await methodsResponse.json();
        setPaymentMethods(methodsData);

        if (methodsData.length > 0) {
          setPaymentMethod(methodsData[0].id);
        }

        // Kredi paketlerini yükle
        const packagesResponse = await fetch('/api/credits/pricing');
        const packagesData = await packagesResponse.json();
        setCreditPackages(packagesData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        toast.error('Veriler yüklenirken bir hata oluştu');
      }
    };

    loadData();
  }, []);

  const handlePaymentMethodChange = (methodId: string) => {
    setPaymentMethod(methodId);
    setSelectedCredit(null);
    setCouponCode('');
    setError(null);
  };

  const handleCouponChange = (value: string) => {
    setCouponCode(value.toUpperCase());
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCredit && paymentMethod !== 'coupon') {
      toast.error('Lütfen bir kredi paketi seçin.');
      return;
    }

    if (paymentMethod === 'coupon' && !couponCode) {
      setError('Lütfen kupon kodunu girin.');
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === 'coupon') {
        const response = await fetch('/api/coupons/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: couponCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Kupon kullanımı başarısız oldu.');
          throw new Error(data.error || 'Kupon kullanımı başarısız oldu.');
        }

        await updateCredits();
        toast.success(data.message || `${data.amount} kredi başarıyla yüklendi!`);
        setCouponCode('');
        setError(null);
        router.push('/dashboard/credits/history');
        router.refresh();
        return;
      }

      const selectedPackage = creditPackages.find(pkg => pkg.id === selectedCredit);
      if (!selectedPackage) {
        throw new Error('Seçilen paket bulunamadı.');
      }

      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPackage.credits,
          paymentMethod,
          packageId: selectedPackage.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kredi yükleme işlemi başarısız oldu.');
      }

      await updateCredits();
      toast.success('Kredi yükleme işlemi başarılı!');
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreditInfo />
        
        <div id="add-credit-section" className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Kredi Yükle
          </h1>

          <div className="mb-8">
            <div className="flex flex-wrap gap-4 mb-6">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodChange(method.id)}
                  className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                    paymentMethod === method.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 text-blue-500" />
                  <span className="text-gray-900 dark:text-white font-medium">{method.name}</span>
                </button>
              ))}
              <button
                onClick={() => handlePaymentMethodChange('coupon')}
                className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
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
            {paymentMethod !== 'coupon' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {creditPackages
                  .filter(pkg => pkg.paymentMethodId === paymentMethod)
                  .map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedCredit(pkg.id)}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        selectedCredit === pkg.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                      }`}
                    >
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {pkg.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {pkg.credits} Kredi - {pkg.price} TL
                      </div>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="mb-8">
                <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kupon Kodu
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="couponCode"
                    value={couponCode}
                    onChange={(e) => handleCouponChange(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      error 
                        ? 'border-red-300 dark:border-red-600 focus:ring-red-500 dark:focus:ring-red-400' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:focus:ring-purple-400'
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:border-transparent uppercase`}
                    placeholder="KUPON KODUNUZU GİRİN"
                    disabled={loading}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-500 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                {error ? (
                  <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md border border-red-200 dark:border-red-800">
                    <div className="flex items-center">
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Kupon kodunuzu büyük harflerle girin. Her kupon yalnızca bir kez kullanılabilir.
                    </p>
                    <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-1">
                      <li>Kuponlar büyük-küçük harfe duyarlıdır</li>
                      <li>Kullanılmış veya süresi dolmuş kuponlar geçersizdir</li>
                      <li>Bazı kuponlar minimum kredi şartı gerektirebilir</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (paymentMethod !== 'coupon' && !selectedCredit) || (paymentMethod === 'coupon' && !couponCode)}
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