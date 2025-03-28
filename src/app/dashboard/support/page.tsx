'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster, toast } from "react-hot-toast";
import {
  MessageSquare,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MessagesSquare
} from "lucide-react";

interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: {
    name: string;
  };
  createdAt: string;
  _count?: {
    messages: number;
  };
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadTickets();
  }, [session, sessionStatus]);

  const loadTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets');
      if (!response.ok) throw new Error('Talepler yüklenemedi');
      
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Talepler yüklenirken hata:', error);
      toast.error('Destek talepleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return theme === 'dark' 
          ? 'bg-yellow-900/30 text-yellow-400' 
          : 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return theme === 'dark' 
          ? 'bg-blue-900/30 text-blue-400' 
          : 'bg-blue-100 text-blue-800';
      case 'closed':
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
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 mr-1.5 text-yellow-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 mr-1.5 text-blue-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 mr-1.5 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 mr-1.5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Açık';
      case 'in_progress':
        return 'İşlemde';
      case 'closed':
        return 'Kapalı';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
              <MessageSquare className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Destek Talepleri</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Tüm destek taleplerinizi buradan görüntüleyebilir ve yönetebilirsiniz
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Destek Talepleri */}
          <div className="lg:col-span-9 space-y-6">
            {/* Yeni Talep Butonu */}
            <div className="flex justify-end">
              <Link
                href="/dashboard/support/new"
                className={`inline-flex items-center px-4 py-2 rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium transition-colors duration-200`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Yeni Talep
              </Link>
            </div>

            {loading ? (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-12 text-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4">Destek talepleriniz yükleniyor...</p>
              </div>
            ) : tickets.length > 0 ? (
              <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center space-x-2">
                    <MessagesSquare className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Destek Talepleriniz</h2>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Konu
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Durum
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Mesajlar
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket.id}
                          onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                          className={`${theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} cursor-pointer transition-colors`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">
                              {ticket.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {ticket.category.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                              {getStatusIcon(ticket.status)}
                              {getStatusText(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>{formatDate(ticket.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="inline-flex items-center">
                              <MessageSquare className="h-4 w-4 mr-1.5 text-gray-400" />
                              <span>{ticket._count?.messages || 0} mesaj</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className={`text-center py-16 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
                <MessageSquare className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">Henüz destek talebi yok</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Yeni bir destek talebi oluşturarak başlayın.</p>
                <div className="mt-6">
                  <Link
                    href="/dashboard/support/new"
                    className={`inline-flex items-center px-4 py-2 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium transition-colors duration-200`}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Yeni Talep Oluştur
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 