"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, ShoppingBag, Plus, Minus, ArrowLeft, CreditCard, Wallet, AlertCircle, CheckCircle2, ShoppingCart, Shield, Clock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/app/ThemeContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { useCartStore } from '@/store/cartStore';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
    stock: number;
  };
}

interface Cart {
  id: string;
  totalPrice: number;
  items: CartItem[];
}

interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
  type: string;
  provider: string;
  isActive: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [userCredits, setUserCredits] = useState<number>(0);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const { updateCartItemCount } = useCartStore();

  useEffect(() => {
    // Sepeti her zaman yükle
    fetchCart();
    
    // Sadece oturum açıksa diğer bilgileri yükle
    if (status === "authenticated") {
      fetchUserCredits();
      fetchPaymentMethods();
    }
  }, [status, router]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/store/cart");
      
      if (!response.ok) {
        throw new Error("Sepet yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error("Sepet yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCredits = async () => {
    try {
      const response = await fetch("/api/user/credits");
      
      if (!response.ok) {
        throw new Error("Kullanıcı kredileri yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setUserCredits(data.credits);
    } catch (error) {
      console.error("Kullanıcı kredileri yüklenirken hata:", error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await fetch("/api/payment-methods");
      
      if (!response.ok) {
        throw new Error("Ödeme yöntemleri yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setPaymentMethods(data);
      
      // Varsayılan olarak ilk ödeme yöntemini seç
      if (data.length > 0) {
        setSelectedPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error("Ödeme yöntemleri yüklenirken hata:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (updatingItem) return;
    
    try {
      setUpdatingItem(itemId);
      const response = await fetch(`/api/store/cart/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün miktarı güncellenirken bir hata oluştu");
      }

      // Sepeti yeniden yükle
      fetchCart();
      // Sepet sayısını güncelle
      updateCartItemCount();
    } catch (error: any) {
      console.error("Ürün miktarı güncellenirken hata:", error);
      alert(error.message || "Ürün miktarı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (deletingItem) return;
    
    try {
      setDeletingItem(itemId);
      const response = await fetch(`/api/store/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ürün sepetten kaldırılırken bir hata oluştu");
      }

      // Sepeti yeniden yükle
      fetchCart();
      // Sepet sayısını güncelle
      updateCartItemCount();
    } catch (error: any) {
      console.error("Ürün sepetten kaldırılırken hata:", error);
      alert(error.message || "Ürün sepetten kaldırılırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setDeletingItem(null);
    }
  };

  const handleCheckout = async () => {
    // Misafir kullanıcı ise giriş sayfasına yönlendir
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/store/cart");
      return;
    }
    
    if (!cart || cart.items.length === 0 || !selectedPaymentMethod) return;
    
    try {
      setProcessingCheckout(true);
      const response = await fetch("/api/store/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          cartId: cart.id,
          paymentMethodId: selectedPaymentMethod
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Sipariş oluşturulurken bir hata oluştu");
      }

      const data = await response.json();
      
      // Sepet sayısını güncelle (sipariş tamamlandığında sepet boşalacak)
      updateCartItemCount();
      
      // Harici ödeme yöntemi seçildiyse ödeme sayfasına yönlendir
      if (data.paymentUrl) {
        router.push(data.paymentUrl);
        return;
      }
      
      // Kredi ile ödeme başarılı ise sipariş tamamlandı sayfasına yönlendir
      router.push(`/store/order-complete?orderId=${data.id}`);
    } catch (error: any) {
      console.error("Sipariş oluşturulurken hata:", error);
      alert(error.message || "Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
  };

  // Seçilen ödeme yöntemini bul
  const selectedPaymentMethodObj = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
  
  // Kredi ile ödeme yapılıp yapılamayacağını kontrol et
  const isCreditPayment = selectedPaymentMethodObj?.type === "CREDIT";
  const hasEnoughCredits = userCredits >= (cart?.totalPrice || 0);
  const isPaymentDisabled = isCreditPayment && !hasEnoughCredits;

  // Ödeme yöntemi ikonunu belirle
  const getPaymentMethodIcon = (type: string, provider: string) => {
    if (type === "CREDIT") {
      return <Wallet className="h-5 w-5 text-green-500" />;
    } else if (provider && (provider.toLowerCase().includes("credit") || provider.toLowerCase().includes("card"))) {
      return <CreditCard className="h-5 w-5 text-blue-500" />;
    } else {
      return <CreditCard className="h-5 w-5 text-purple-500" />;
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg">Sepetiniz yükleniyor...</p>
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
        {/* Sepet Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] bg-center"></div>
          </div>
          <div className="container mx-auto px-4 py-10 relative z-10">
            <Link 
              href="/store" 
              className="inline-flex items-center text-white/80 hover:text-white mb-4 group transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              <span>Alışverişe Devam Et</span>
            </Link>
            
            <div className="flex items-center">
              <div className="mr-4 bg-white/10 backdrop-blur-sm p-3 rounded-full">
                <ShoppingCart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Alışveriş Sepetiniz</h1>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Sepet Özellikleri */}
          <div className="mb-8 mt-4">
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Güvenli Ödeme</h3>
                  <p className="text-sm opacity-80">Tüm ödemeleriniz 256-bit SSL ile şifrelenir.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Anında Teslimat</h3>
                  <p className="text-sm opacity-80">Ödemeniz onaylandıktan sonra anında teslim edilir.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-3 mt-1">
                  <CheckCircle2 className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">%100 Orijinal</h3>
                  <p className="text-sm opacity-80">Tüm ürünlerimiz orijinal Microsoft lisanslarıdır.</p>
                </div>
              </div>
            </div>
          </div>

          {!cart || cart.items.length === 0 ? (
            <div className={`text-center py-16 px-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl font-medium mb-4">Sepetiniz boş</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sepetinize ürün eklemek için mağazamızı ziyaret edebilirsiniz.
              </p>
              <Link 
                href="/store" 
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 ${
                  theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                Mağazaya Git
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-xl font-semibold">Sepet İçeriği</h2>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-16">
                      <Loader2 className={`h-12 w-12 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                    </div>
                  ) : (
                    <div>
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {cart.items.map((item) => (
                          <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 group">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                              {item.product.imageUrl ? (
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  className="object-cover object-center"
                                />
                              ) : (
                                <div className={`h-full w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                  <ShoppingBag className={`h-10 w-10 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <h3 className="font-semibold text-lg">{item.product.name}</h3>
                              <p className="text-blue-600 dark:text-blue-400 font-medium">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={updatingItem === item.id || item.quantity <= 1}
                                className={`p-1 rounded-full ${
                                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                } transition-colors ${
                                  updatingItem === item.id || item.quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              
                              <span className="w-8 text-center">{item.quantity}</span>
                              
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={updatingItem === item.id || item.quantity >= item.product.stock}
                                className={`p-1 rounded-full ${
                                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                                } transition-colors ${
                                  updatingItem === item.id || item.quantity >= item.product.stock ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-bold">
                                {formatPrice(item.price * item.quantity)}
                              </p>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={deletingItem === item.id}
                                className={`mt-2 text-red-500 hover:text-red-700 transition-colors inline-flex items-center ${
                                  deletingItem === item.id ? 'opacity-50 cursor-wait' : ''
                                }`}
                              >
                                {deletingItem === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                  <Trash2 className="h-4 w-4 mr-1" />
                                )}
                                <span>Kaldır</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className={`rounded-xl overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                    <h2 className="text-xl font-semibold">Sipariş Özeti</h2>
                  </div>
                  
                  <div className="p-6">
                    {cart && cart.items.length > 0 ? (
                      <>
                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between">
                            <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Ara Toplam</span>
                            <span className="font-medium">{formatPrice(cart.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>Toplam</span>
                            <span>{formatPrice(cart.totalPrice)}</span>
                          </div>
                        </div>

                        {status === "unauthenticated" ? (
                          <div className="space-y-4">
                            <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <p className="text-sm mb-4">
                                Siparişi tamamlamak için giriş yapmanız gerekmektedir.
                              </p>
                              <Link
                                href={`/auth/login?callbackUrl=${encodeURIComponent('/store/cart')}`}
                                className={`w-full block text-center py-3 px-4 rounded-lg font-medium ${
                                  theme === 'dark' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                } transition-all duration-200`}
                              >
                                Giriş Yap
                              </Link>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Hesabınız yok mu?{' '}
                                <Link 
                                  href="/auth/register" 
                                  className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Kayıt Ol
                                </Link>
                              </p>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Ödeme Yöntemleri */}
                            <div className="mb-6">
                              <h3 className={`text-base font-medium mb-3 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                                Ödeme Yöntemi
                              </h3>
                              
                              {loadingPaymentMethods ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {/* Kredi ile Ödeme */}
                                  <label className={`block relative p-4 border rounded-lg cursor-pointer transition-all ${
                                    selectedPaymentMethod === 'credit'
                                      ? theme === 'dark'
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-blue-500 bg-blue-50'
                                      : theme === 'dark'
                                        ? 'border-gray-700 hover:border-gray-600'
                                        : 'border-gray-200 hover:border-gray-300'
                                  }`}>
                                    <input
                                      type="radio"
                                      name="paymentMethod"
                                      value="credit"
                                      checked={selectedPaymentMethod === 'credit'}
                                      onChange={() => setSelectedPaymentMethod('credit')}
                                      className="sr-only"
                                    />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <div className={`p-2 rounded-full mr-3 ${
                                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                        }`}>
                                          <Wallet className="h-5 w-5 text-blue-500" />
                                        </div>
                                        <div>
                                          <p className="font-medium">Kredi ile Öde</p>
                                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Mevcut Bakiye: {formatPrice(userCredits)}
                                          </p>
                                        </div>
                                      </div>
                                      {selectedPaymentMethod === 'credit' && (
                                        <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                      )}
                                    </div>
                                    
                                    {selectedPaymentMethod === 'credit' && !hasEnoughCredits && (
                                      <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start">
                                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <div>
                                          <p className="text-sm text-red-500 font-medium">Yetersiz bakiye</p>
                                          <p className="text-xs text-red-400">
                                            Bu siparişi tamamlamak için {formatPrice(cart.totalPrice - userCredits)} daha krediye ihtiyacınız var.
                                          </p>
                                          <Link
                                            href="/dashboard/credits/add"
                                            className="text-xs text-blue-500 hover:underline mt-1 inline-block"
                                          >
                                            Kredi Yükle
                                          </Link>
                                        </div>
                                      </div>
                                    )}
                                  </label>
                                  
                                  {/* Diğer Ödeme Yöntemleri */}
                                  {paymentMethods.map((method) => (
                                    <label
                                      key={method.id}
                                      className={`block relative p-4 border rounded-lg cursor-pointer transition-all ${
                                        selectedPaymentMethod === method.id
                                          ? theme === 'dark'
                                            ? 'border-blue-500 bg-blue-900/20'
                                            : 'border-blue-500 bg-blue-50'
                                          : theme === 'dark'
                                            ? 'border-gray-700 hover:border-gray-600'
                                            : 'border-gray-200 hover:border-gray-300'
                                      }`}
                                    >
                                      <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={selectedPaymentMethod === method.id}
                                        onChange={() => setSelectedPaymentMethod(method.id)}
                                        className="sr-only"
                                      />
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                          <div className={`p-2 rounded-full mr-3 ${
                                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                                          }`}>
                                            {method.provider === 'CREDIT_CARD' ? (
                                              <CreditCard className="h-5 w-5 text-blue-500" />
                                            ) : method.provider === 'BANK_TRANSFER' ? (
                                              <Clock className="h-5 w-5 text-blue-500" />
                                            ) : (
                                              <Shield className="h-5 w-5 text-blue-500" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="font-medium">{method.name}</p>
                                            {method.description && (
                                              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                {method.description}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        {selectedPaymentMethod === method.id && (
                                          <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                        )}
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={handleCheckout}
                              disabled={
                                !cart || 
                                cart.items.length === 0 || 
                                !selectedPaymentMethod || 
                                processingCheckout ||
                                isPaymentDisabled
                              }
                              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                                !cart || 
                                cart.items.length === 0 || 
                                !selectedPaymentMethod || 
                                processingCheckout ||
                                isPaymentDisabled
                                  ? theme === 'dark'
                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : theme === 'dark'
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                              } transition-all duration-200`}
                            >
                              {processingCheckout ? (
                                <>
                                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                  İşleniyor...
                                </>
                              ) : (
                                <>
                                  Siparişi Tamamla
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                        <p className="text-center">
                          Sepetinizde ürün bulunmuyor.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Güvenli Ödeme Bilgisi */}
                <div className={`mt-4 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                  <div className="flex items-center mb-2">
                    <Shield className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                    <h3 className="font-medium">Güvenli Ödeme</h3>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tüm ödemeleriniz 256-bit SSL sertifikası ile şifrelenerek korunmaktadır.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
      <Toaster position="bottom-center" />
    </div>
  );
} 