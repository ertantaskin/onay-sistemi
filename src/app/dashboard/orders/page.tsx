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
  ShoppingBag,
  Calendar,
  Package,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Download,
  Eye,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

interface Order {
  id: string;
  productName: string;
  date: string;
  status: string;
  amount: number;
  licenseKey?: string;
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  useEffect(() => {
    // Filtreleme işlemleri
    let result = [...orders];
    
    // Arama sorgusu filtreleme
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.productName.toLowerCase().includes(query) || 
        order.id.toLowerCase().includes(query)
      );
    }
    
    // Durum filtreleme
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status.toLowerCase() === statusFilter);
    }
    
    setFilteredOrders(result);
  }, [orders, searchQuery, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/store/orders');
      
      if (!response.ok) {
        throw new Error('Siparişler yüklenirken bir hata oluştu');
      }
      
      const ordersData = await response.json();
      
      // API'den gelen veriyi Order tipine dönüştür
      const formattedOrders = ordersData.map((order: any) => {
        // Siparişteki ilk ürünü al
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
        const productName = firstItem && firstItem.product ? firstItem.product.name : 'Bilinmeyen Ürün';
        const licenseKey = firstItem ? firstItem.licenseKey : '';
        
        return {
          id: order.id,
          productName: productName,
          date: order.createdAt,
          status: order.status.toLowerCase(),
          amount: order.totalPrice,
          licenseKey: licenseKey
        };
      });
      
      setOrders(formattedOrders);
      setFilteredOrders(formattedOrders);
    } catch (error) {
      console.error('Siparişler yüklenirken hata:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
    toast.success('Siparişler yenilendi');
  };
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return theme === 'dark' 
          ? 'bg-green-900/30 text-green-400' 
          : 'bg-green-100 text-green-800';
      case 'pending':
        return theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return theme === 'dark' 
          ? 'bg-blue-900/30 text-blue-400' 
          : 'bg-blue-100 text-blue-800';
      case 'cancelled':
      case 'failed':
        return theme === 'dark' 
          ? 'bg-red-900/30 text-red-400' 
          : 'bg-red-100 text-red-800';
      default:
        return theme === 'dark' 
          ? 'bg-gray-900/30 text-gray-400' 
          : 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'Tamamlandı';
      case 'pending':
        return 'Beklemede';
      case 'processing':
        return 'İşleniyor';
      case 'cancelled':
        return 'İptal Edildi';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <Header />
        <div className="pt-20 flex justify-center items-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Siparişleriniz yükleniyor...</p>
          </div>
        </div>
        <Toaster position="top-center" />
      </div>
    );
  }

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
              <ShoppingBag className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Siparişlerim</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Tüm sipariş geçmişinizi görüntüleyin ve yönetin
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Siparişler Listesi */}
          <div className="lg:col-span-9 space-y-6">
            {/* Filtreler ve Arama */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Filtreler</h2>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                  {/* Arama Kutusu */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Sipariş ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-200 placeholder-gray-500'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {/* Durum Filtresi */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={`appearance-none w-full md:w-48 pl-4 pr-10 py-2 rounded-lg ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-gray-50 border-gray-200'
                      } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="pending">Beklemede</option>
                      <option value="processing">İşleniyor</option>
                      <option value="cancelled">İptal Edildi</option>
                      <option value="failed">Başarısız</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                  
                  {/* Yenile Butonu */}
                  <button
                    onClick={refreshOrders}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <RefreshCw className="h-5 w-5" />
                    <span>Yenile</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Siparişler Listesi */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Siparişlerim</h2>
                </div>
              </div>
              
              {filteredOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Sipariş Bulunamadı</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Filtrelere uygun sipariş bulunamadı. Filtreleri değiştirmeyi deneyin.' 
                      : 'Henüz hiç sipariş vermediniz. Mağazamızdan ürün satın alarak başlayabilirsiniz.'}
                  </p>
                  <button
                    onClick={() => router.push('/store')}
                    className={`mt-4 inline-flex items-center px-4 py-2 rounded-lg font-medium ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    } transition-colors duration-200`}
                  >
                    Mağazaya Git
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Ürün
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Sipariş Tarihi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tutar
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`p-2 rounded-lg ${
                                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                              } mr-3`}>
                                <Package className="h-5 w-5 text-blue-500" />
                              </div>
                              <div>
                                <div className="font-medium">{order.productName}</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ID: {order.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{new Date(order.date).toLocaleDateString('tr-TR')}</span>
                            </div>
                            <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {new Date(order.date).toLocaleTimeString('tr-TR')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1.5">{getStatusText(order.status)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">₺{order.amount.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                                className={`p-2 rounded-lg ${
                                  theme === 'dark' 
                                    ? 'hover:bg-gray-700 text-gray-300' 
                                    : 'hover:bg-gray-100 text-gray-700'
                                } transition-colors duration-200`}
                                title="Sipariş Detayı"
                              >
                                <Eye className="h-5 w-5" />
                              </button>
                              {order.status.toLowerCase() === 'completed' && (
                                <button
                                  className={`p-2 rounded-lg ${
                                    theme === 'dark' 
                                      ? 'hover:bg-gray-700 text-gray-300' 
                                      : 'hover:bg-gray-100 text-gray-700'
                                  } transition-colors duration-200`}
                                  title="Fatura İndir"
                                >
                                  <Download className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 