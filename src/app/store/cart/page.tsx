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
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const { updateCartItemCount } = useCartStore();

  useEffect(() => {
    // Sepeti her zaman yükle
    fetchCart();
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
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
      <Toaster position="top-center" />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/store" className={`flex items-center text-sm font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Alışverişe Devam Et
          </Link>
        </div>
        
        <h1 className={`text-3xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Alışveriş Sepetim</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className={`h-12 w-12 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md p-8 text-center`}>
            <div className="flex justify-center mb-4">
              <ShoppingBag className={`h-16 w-16 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sepetiniz Boş</h2>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Sepetinizde henüz ürün bulunmuyor.</p>
            <Link href="/store" className={`inline-flex items-center px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors`}>
              <ShoppingCart className="h-5 w-5 mr-2" />
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Ürünler ({cart.items.length})</h2>
                </div>
                
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cart.items.map((item) => (
                    <li key={item.id} className="px-6 py-4">
                      <div className="flex items-center space-x-4">
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
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className={`rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md overflow-hidden sticky top-24`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sipariş Özeti</h2>
                </div>
                
                <div className="p-6">
                  <div className={`space-y-4 mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="flex justify-between">
                      <span>Ara Toplam</span>
                      <span>{formatPrice(cart.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Toplam</span>
                      <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{formatPrice(cart.totalPrice)}</span>
                    </div>
                  </div>
                  
                  {!session ? (
                    <div className="mb-6">
                      <button
                        onClick={() => router.push('/store/checkout')}
                        className={`w-full py-3 px-4 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors flex items-center justify-center`}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Ödemeye Geç
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <button
                        onClick={() => router.push('/store/checkout')}
                        className={`w-full py-3 px-4 rounded-md ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium transition-colors flex items-center justify-center`}
                      >
                        <CreditCard className="h-5 w-5 mr-2" />
                        Ödemeye Geç
                      </button>
                    </div>
                  )}
                  
                  <div className={`mt-6 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>Güvenli ödeme işlemi</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Hızlı teslimat</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      <span>%100 Orijinal ürün garantisi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
} 