'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import {
  CreditCard,
  History,
  UserCircle,
  Bell,
  Wallet,
  Receipt,
  BellRing,
  TrendingUp,
  Users,
  ShoppingCart,
  Package,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShoppingBag
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  credits: number;
  notifications: number;
}

interface RecentOrder {
  id: string;
  productName: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  amount: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    credits: 0,
    notifications: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini getir
      let userCredits = 0;
      try {
        const userResponse = await fetch('/api/users/me');
        if (userResponse.ok) {
          const userData = await userResponse.json();
          userCredits = userData.user?.credits || 0;
        } else {
          console.error('Kullanıcı bilgileri alınamadı');
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
      }
      
      // Sipariş sayısını getir
      let orderCount = 0;
      try {
        const ordersResponse = await fetch('/api/orders/count');
        if (ordersResponse.ok) {
          const ordersData = await ordersResponse.json();
          orderCount = ordersData.count || 0;
        } else {
          console.error('Sipariş sayısı alınamadı');
        }
      } catch (error) {
        console.error('Sipariş sayısı yüklenirken hata:', error);
      }
      
      // Toplam harcamayı getir
      let totalSpent = 0;
      try {
        const spentResponse = await fetch('/api/orders/total-spent');
        if (spentResponse.ok) {
          const spentData = await spentResponse.json();
          totalSpent = spentData.totalSpent || 0;
        } else {
          console.error('Toplam harcama bilgisi alınamadı');
        }
      } catch (error) {
        console.error('Toplam harcama bilgisi yüklenirken hata:', error);
      }
      
      // Son siparişleri getir
      let userRecentOrders: RecentOrder[] = [];
      try {
        const recentOrdersResponse = await fetch('/api/orders/recent');
        if (recentOrdersResponse.ok) {
          const recentOrdersData = await recentOrdersResponse.json();
          userRecentOrders = recentOrdersData.orders || [];
        } else {
          console.error('Son siparişler alınamadı');
        }
      } catch (error) {
        console.error('Son siparişler yüklenirken hata:', error);
      }
      
      // Verileri güncelle
      setStats({
        totalOrders: orderCount,
        totalSpent: totalSpent,
        credits: userCredits,
        notifications: 3
      });

      // Son siparişleri güncelle
      setRecentOrders(userRecentOrders);
      
    } catch (error) {
      console.error('Dashboard verisi yüklenirken hata:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
        <Toaster position="top-center" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <Header />
      <Toaster position="top-center" />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Dashboard Başlığı */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } shadow-lg`}>
              <TrendingUp className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Hoş geldiniz, {session?.user?.name}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Orta Kolon - İstatistikler ve Son Siparişler */}
          <div className="lg:col-span-6 space-y-8">
            {/* Hızlı İşlem Kartları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Mağazaya Git */}
              <div 
                className={`relative group overflow-hidden rounded-xl ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-700/50 hover:border-amber-600' 
                  : 'bg-gradient-to-br from-amber-50 to-amber-50 border border-amber-100 hover:border-amber-300'
                } shadow-md hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer h-full`}
                onClick={() => router.push('/store')}
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all duration-500"></div>
                
                <div className="p-4 relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 bg-gradient-to-br ${
                    theme === 'dark'
                      ? 'from-amber-600/70 to-amber-700/40 text-amber-300 shadow-inner shadow-amber-700/30'
                      : 'from-amber-400 to-amber-500 text-white shadow-md'
                  } transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span className={`bg-gradient-to-r ${
                      theme === 'dark'
                        ? 'from-amber-400 to-amber-300 bg-clip-text text-transparent'
                        : 'from-amber-600 to-amber-500 bg-clip-text text-transparent'
                    }`}>Mağazaya Git</span>
                  </h3>
                  
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-amber-300/70' : 'text-amber-700/70'}`}>
                    Tüm ürünlerimize göz atın
                  </p>
                  
                  <div className={`inline-flex items-center text-xs font-medium ${
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  } group-hover:translate-x-1 transition-transform duration-300`}>
                    <span>Ziyaret Et</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:ml-2 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Kredi Yükle */}
              <div 
                className={`relative group overflow-hidden rounded-xl ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border border-green-700/50 hover:border-green-600' 
                  : 'bg-gradient-to-br from-green-50 to-green-50 border border-green-100 hover:border-green-300'
                } shadow-md hover:shadow-green-500/10 transition-all duration-300 cursor-pointer h-full`}
                onClick={() => router.push('/dashboard/credits')}
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-500"></div>
                
                <div className="p-4 relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 bg-gradient-to-br ${
                    theme === 'dark'
                      ? 'from-green-600/70 to-green-700/40 text-green-300 shadow-inner shadow-green-700/30'
                      : 'from-green-400 to-green-500 text-white shadow-md'
                  } transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span className={`bg-gradient-to-r ${
                      theme === 'dark'
                        ? 'from-green-400 to-green-300 bg-clip-text text-transparent'
                        : 'from-green-600 to-green-500 bg-clip-text text-transparent'
                    }`}>Bakiye Yükle</span>
                  </h3>
                  
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-green-300/70' : 'text-green-700/70'}`}>
                    Kredi kartı veya kuponla
                  </p>
                  
                  <div className={`inline-flex items-center text-xs font-medium ${
                    theme === 'dark' ? 'text-green-400' : 'text-green-600'
                  } group-hover:translate-x-1 transition-transform duration-300`}>
                    <span>Yükleme Yap</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:ml-2 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Destek Talebi */}
              <div 
                className={`relative group overflow-hidden rounded-xl ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-sky-900/40 to-sky-800/30 border border-sky-700/50 hover:border-sky-600' 
                  : 'bg-gradient-to-br from-sky-50 to-sky-50 border border-sky-100 hover:border-sky-300'
                } shadow-md hover:shadow-sky-500/10 transition-all duration-300 cursor-pointer h-full`}
                onClick={() => router.push('/dashboard/support')}
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 transition-all duration-500"></div>
                
                <div className="p-4 relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 bg-gradient-to-br ${
                    theme === 'dark'
                      ? 'from-sky-600/70 to-sky-700/40 text-sky-300 shadow-inner shadow-sky-700/30'
                      : 'from-sky-400 to-sky-500 text-white shadow-md'
                  } transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <BellRing className="h-6 w-6" />
            </div>

                  <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span className={`bg-gradient-to-r ${
                      theme === 'dark'
                        ? 'from-sky-400 to-sky-300 bg-clip-text text-transparent'
                        : 'from-sky-600 to-sky-500 bg-clip-text text-transparent'
                    }`}>Destek Talebi</span>
                  </h3>
                  
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-sky-300/70' : 'text-sky-700/70'}`}>
                    Hemen yardım alın
                  </p>
                  
                  <div className={`inline-flex items-center text-xs font-medium ${
                    theme === 'dark' ? 'text-sky-400' : 'text-sky-600'
                  } group-hover:translate-x-1 transition-transform duration-300`}>
                    <span>Destek Al</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:ml-2 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Siparişlerim */}
              <div 
                className={`relative group overflow-hidden rounded-xl ${theme === 'dark' 
                  ? 'bg-gradient-to-br from-indigo-900/40 to-indigo-800/30 border border-indigo-700/50 hover:border-indigo-600' 
                  : 'bg-gradient-to-br from-indigo-50 to-indigo-50 border border-indigo-100 hover:border-indigo-300'
                } shadow-md hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer h-full`}
                onClick={() => router.push('/dashboard/orders')}
              >
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-all duration-500"></div>
                
                <div className="p-4 relative z-10">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl mb-3 bg-gradient-to-br ${
                    theme === 'dark'
                      ? 'from-indigo-600/70 to-indigo-700/40 text-indigo-300 shadow-inner shadow-indigo-700/30'
                      : 'from-indigo-400 to-indigo-500 text-white shadow-md'
                  } transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300">
                    <span className={`bg-gradient-to-r ${
                      theme === 'dark'
                        ? 'from-indigo-400 to-indigo-300 bg-clip-text text-transparent'
                        : 'from-indigo-600 to-indigo-500 bg-clip-text text-transparent'
                    }`}>Siparişlerim</span>
                  </h3>
                  
                  <p className={`text-xs mb-3 ${theme === 'dark' ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
                    Siparişleri görüntüle
                  </p>
                  
                  <div className={`inline-flex items-center text-xs font-medium ${
                    theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                  } group-hover:translate-x-1 transition-transform duration-300`}>
                    <span>Görüntüle</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1 group-hover:ml-2 transition-all duration-300" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                  }`}>
                    <ShoppingBag className="h-6 w-6 text-blue-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Toplam Sipariş
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.totalOrders}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Son 30 günde
                </p>
              </div>

              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  }`}>
                    <Wallet className="h-6 w-6 text-green-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Toplam Harcama
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">₺{stats.totalSpent}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Son 30 günde
                </p>
              </div>

              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                  }`}>
                    <CreditCard className="h-6 w-6 text-yellow-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Kredi Bakiyesi
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">₺{stats.credits}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Mevcut bakiye
                </p>
              </div>

              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                  }`}>
                    <BellRing className="h-6 w-6 text-purple-500" />
                  </div>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Bildirimler
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{stats.notifications}</h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Okunmamış bildirim
                </p>
              </div>
            </div>

            {/* Son Siparişler */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <ShoppingBag className="h-5 w-5 mr-2 text-blue-500" />
                    Son Siparişler
                  </h2>
                  <button
                    onClick={() => router.push('/dashboard/orders')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    } transition-colors duration-200`}
                  >
                    Tümünü Gör
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-600' : 'bg-white'
                        }`}>
                          <Package className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {order.productName}
                          </h3>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {new Date(order.date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ₺{order.amount}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {order.status === 'completed' ? 'Tamamlandı' : order.status === 'pending' ? 'Beklemede' : 'Başarısız'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Kolon - Bildirimler ve Hızlı İşlemler */}
          <div className="lg:col-span-3 space-y-8">
          {/* Kredi Bilgisi */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <Wallet className="h-5 w-5 mr-2 text-yellow-500" />
                    Kredi Bilgisi
                  </h2>
                  <button
                    onClick={() => router.push('/dashboard/credits/history')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      theme === 'dark' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    } transition-colors duration-200`}
                  >
                    Geçmiş
                  </button>
                </div>
              </div>
              
              <div className="p-6">
            <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Mevcut Krediniz
                    </p>
                    <p className="text-2xl font-bold">₺{stats.credits}</p>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/credits')}
                    className={`inline-flex items-center px-4 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                        : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                    } transition-colors duration-200`}
                  >
                    Kredi Yükle
                  </button>
                </div>
              </div>
            </div>

            {/* Bildirimler */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <Bell className="h-5 w-5 mr-2 text-blue-500" />
                    Bildirimler
                  </h2>
                  <button
                    onClick={() => router.push('/dashboard/notifications')}
                    className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    } transition-colors duration-200`}
                  >
                    Tümünü Gör
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <CheckCircle2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Siparişiniz tamamlandı
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Microsoft 365 siparişiniz başarıyla tamamlandı.
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-yellow-500/20' : 'bg-yellow-100'
                    }`}>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Kredi yüklendi
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Hesabınıza 100₺ kredi yüklendi.
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className={`p-2 rounded-lg ${
                      theme === 'dark' ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      <XCircle className="h-5 w-5 text-red-500" />
                    </div>
              <div>
                      <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Sipariş başarısız
                      </p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Windows 11 Pro siparişiniz başarısız oldu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hızlı İşlemler */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  Hızlı İşlemler
                </h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/store')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-50 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-3" />
                    <span className="font-medium">Yeni Sipariş</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/profile')}
                    className={`w-full flex items-center px-4 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'hover:bg-gray-700/50 text-gray-300' 
                        : 'hover:bg-gray-50 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    <UserCircle className="h-5 w-5 mr-3" />
                    <span className="font-medium">Profil Düzenle</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 