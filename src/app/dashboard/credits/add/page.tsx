'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import { CreditInfo } from '@/components/dashboard/CreditInfo';
import { useCreditStore } from '@/store/creditStore';
import {
  CreditCard,
  Gift,
  Wallet,
  AlertCircle,
  CheckCircle,
  PackageCheck
} from "lucide-react";

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const { updateCredits } = useCreditStore();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [creditPackages, setCreditPackages] = useState<CreditPackage[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router]);

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
              <Wallet className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kredi Yükleme</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Kredi kartı veya kupon kodu ile hesabınıza kredi yükleyin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Orta ve Sağ Kolon - Kredi Yükleme Formları */}
          <div className="lg:col-span-9 space-y-6">
            {/* Mevcut Kredi Bilgisi */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
              <CreditInfo />
            </div>
            
            {/* Ödeme Yöntemleri */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Ödeme Yöntemi Seçin</h2>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex flex-wrap gap-4 mb-6">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodChange(method.id)}
                      className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      } border-2 transition-colors ${
                        paymentMethod === method.id
                          ? theme === 'dark' 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-blue-500 bg-blue-50'
                          : theme === 'dark'
                            ? 'border-gray-600 hover:border-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <CreditCard className={`h-6 w-6 ${
                        paymentMethod === method.id ? 'text-blue-500' : 'text-gray-400'
                      }`} />
                      <span className="font-medium">{method.name}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => handlePaymentMethodChange('coupon')}
                    className={`flex-1 min-w-[200px] flex items-center justify-center space-x-2 p-4 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                    } border-2 transition-colors ${
                      paymentMethod === 'coupon'
                        ? theme === 'dark' 
                          ? 'border-purple-500 bg-purple-900/20' 
                          : 'border-purple-500 bg-purple-50'
                        : theme === 'dark'
                          ? 'border-gray-600 hover:border-purple-700'
                          : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Gift className={`h-6 w-6 ${
                      paymentMethod === 'coupon' ? 'text-purple-500' : 'text-gray-400'
                    }`} />
                    <span className="font-medium">Kupon Kodu</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Kredi Paketleri veya Kupon Kodu Formu */}
            <form onSubmit={handleSubmit}>
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    {paymentMethod === 'coupon' ? (
                      <Gift className="h-5 w-5 text-purple-500" />
                    ) : (
                      <PackageCheck className="h-5 w-5 text-green-500" />
                    )}
                    <h2 className="text-lg font-semibold">
                      {paymentMethod === 'coupon' ? 'Kupon Kodu Girin' : 'Kredi Paketi Seçin'}
                    </h2>
                  </div>
                </div>
                
                <div className="p-6">
                  {paymentMethod !== 'coupon' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {creditPackages
                        .filter(pkg => pkg.paymentMethodId === paymentMethod)
                        .map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setSelectedCredit(pkg.id)}
                            className={`p-4 rounded-lg ${
                              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                            } border-2 transition-colors ${
                              selectedCredit === pkg.id
                                ? theme === 'dark' 
                                  ? 'border-green-500 bg-green-900/20' 
                                  : 'border-green-500 bg-green-50'
                                : theme === 'dark'
                                  ? 'border-gray-600 hover:border-green-700'
                                  : 'border-gray-200 hover:border-green-300'
                            }`}
                          >
                            <div className="text-lg font-semibold">
                              {pkg.name}
                            </div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {pkg.credits} Kredi - {pkg.price} TL
                            </div>
                          </button>
                        ))}
                    </div>
                  ) : (
                    <div className="mb-8">
                      <label htmlFor="couponCode" className="block text-sm font-medium mb-2">
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
                              ? theme === 'dark'
                                ? 'border-red-600 focus:ring-red-400 bg-red-900/10' 
                                : 'border-red-300 focus:ring-red-500 bg-red-50'
                              : theme === 'dark'
                                ? 'border-gray-600 focus:ring-purple-400 bg-gray-700' 
                                : 'border-gray-300 focus:ring-purple-500 bg-white'
                          } focus:ring-2 focus:border-transparent uppercase placeholder-gray-400`}
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
                        <div className={`mt-2 text-sm ${
                          theme === 'dark' 
                            ? 'text-red-400 bg-red-900/20 border-red-800' 
                            : 'text-red-600 bg-red-50 border-red-200'
                        } p-2 rounded-md border flex items-center`}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {error}
                        </div>
                      ) : (
                        <div className="mt-2 space-y-2">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Kupon kodunuzu büyük harflerle girin. Her kupon yalnızca bir kez kullanılabilir.
                          </p>
                          <ul className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} list-disc list-inside space-y-1`}>
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
                    className={`w-full py-3 px-4 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    {loading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 