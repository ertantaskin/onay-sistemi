"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShoppingBag, ArrowLeft, Loader2, Package, CreditCard, Calendar, User } from "lucide-react";
import { useTheme } from "@/app/ThemeContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  licenseKey?: string;
  product: {
    name: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  status: string;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  paymentMethod?: {
    id: string;
    name: string;
    type: string;
  };
}

export default function OrderCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get("orderId");

  useEffect(() => {
    if (!orderId) {
      router.push("/store");
      return;
    }

    fetchOrder(orderId);
  }, [orderId, router]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/store/orders/${id}`);
      
      if (!response.ok) {
        throw new Error("Sipariş bilgileri yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error("Sipariş bilgileri yüklenirken hata:", error);
      setError("Sipariş bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
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

  const getPaymentMethodName = () => {
    if (order?.paymentMethod) {
      return order.paymentMethod.name;
    }
    
    // Kredi ile ödeme yapıldıysa
    if (order?.paymentMethod?.id === 'credit' || order?.paymentMethod?.type === 'CREDIT') {
      return 'Kredi ile Ödeme';
    }
    
    return "Kredi ile Ödeme";
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg">Sipariş bilgileri yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-red-100 dark:bg-red-900/30 p-6 rounded-lg">
              <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
              <Link 
                href="/store" 
                className={`inline-flex items-center px-4 py-2 rounded-md font-medium ${
                  theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Mağazaya Dön
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
          }}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <div className="pt-20">
        {/* Başarılı Sipariş Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center"></div>
          </div>
          <div className="container mx-auto px-4 py-12 relative z-10 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Siparişiniz Tamamlandı!</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">
              Siparişiniz başarıyla oluşturuldu. Satın aldığınız ürünlere aşağıdan erişebilirsiniz.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Sipariş Özeti Kartı */}
            <div className={`rounded-xl overflow-hidden shadow-md mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">Sipariş Özeti</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Package className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sipariş Numarası</p>
                        <p className="font-medium">{order?.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sipariş Tarihi</p>
                        <p className="font-medium">{order ? formatDate(order.createdAt) : '-'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Ödeme Yöntemi</p>
                        <p className="font-medium">{getPaymentMethodName()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <User className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Sipariş Durumu</p>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Tamamlandı
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold mb-4">Sipariş Öğeleri</h3>
                  
                  <div className="space-y-4">
                    {order?.items.map((item) => (
                      <div key={item.id} className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-4">
                            {item.product.imageUrl ? (
                              <div className="relative h-16 w-16 bg-gray-100 dark:bg-gray-600 rounded-md overflow-hidden">
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  className="object-contain p-2"
                                />
                              </div>
                            ) : (
                              <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-700 rounded-md flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-grow">
                            <h4 className="font-medium">{item.product.name}</h4>
                            <div className="flex justify-between mt-1">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {formatPrice(item.price)} x {item.quantity}
                              </p>
                              <p className="font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                            
                            {item.licenseKey && (
                              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-100 dark:border-blue-800">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Lisans Anahtarı:</p>
                                <p className="font-mono text-sm select-all">{item.licenseKey}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    <span className="font-bold text-lg">Toplam</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {order ? formatPrice(order.totalPrice) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Yönlendirme Butonları */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Link 
                href="/store" 
                className={`px-6 py-3 rounded-lg font-medium text-center ${
                  theme === 'dark' 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                <ArrowLeft className="w-4 h-4 inline-block mr-2" />
                Alışverişe Devam Et
              </Link>
              
              <Link 
                href="/dashboard/credits/history" 
                className={`px-6 py-3 rounded-lg font-medium text-center ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Kredi Geçmişini Görüntüle
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: theme === 'dark' ? '!bg-gray-800 !text-white' : '',
        }}
      />
    </div>
  );
} 