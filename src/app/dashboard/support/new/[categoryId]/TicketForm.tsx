'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/app/ThemeContext';
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  MessageSquareText,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface FormData {
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
}

interface TicketFormProps {
  categoryId: string;
}

export default function TicketForm({ categoryId }: TicketFormProps) {
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    message: '',
    priority: 'normal'
  });
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    if (categoryId) {
      loadCategory(categoryId);
    }
  }, [categoryId, session, sessionStatus]);

  const loadCategory = async (id: string) => {
    try {
      const response = await fetch(`/api/support/categories/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Kategori bulunamadı');
          router.push('/dashboard/support/new');
          return;
        }
        throw new Error('Kategori yüklenemedi');
      }
      
      const data = await response.json();
      setCategory(data);
    } catch (error) {
      toast.error('Kategori yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          categoryId: category.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Talep oluşturulurken bir hata oluştu');
      }

      toast.success('Destek talebi başarıyla oluşturuldu');
      router.push('/dashboard/support');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Talep oluşturulurken bir hata oluştu');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'normal':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  if (loading && sessionStatus !== 'loading') {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Kategori bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Sayfa Başlığı */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } shadow-lg`}>
            <MessageSquareText className="h-12 w-12 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {category ? `Yeni Talep - ${category.name}` : 'Yeni Talep'}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {category?.description || 'Lütfen talep detaylarını doldurun'}
            </p>
          </div>
        </div>
      </div>

      {/* Geri Dön Butonu */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className={`flex items-center text-sm ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon - Dashboard Sidebar */}
        <div className="lg:col-span-3">
          <DashboardSidebar />
        </div>

        {/* Sağ Kolon - Form */}
        <div className="lg:col-span-9">
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <MessageSquareText className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Talep Detayları</h2>
              </div>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Konu
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } focus:ring-2 focus:border-transparent transition-colors`}
                    placeholder="Talebinizin konusunu girin"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="block text-sm font-medium">
                    Öncelik
                  </label>
                  <div className="relative">
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'normal' | 'high' })}
                      className={`w-full pl-12 pr-4 py-3 rounded-lg border appearance-none ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                      } focus:ring-2 focus:border-transparent transition-colors`}
                    >
                      <option value="low">Düşük</option>
                      <option value="normal">Normal</option>
                      <option value="high">Yüksek</option>
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      {getPriorityIcon(formData.priority)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Mesaj
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className={`w-full px-4 py-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500'
                    } focus:ring-2 focus:border-transparent transition-colors resize-none`}
                    placeholder="Talebinizin detaylarını açıklayın"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Link
                    href="/dashboard/support"
                    className={`px-6 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } font-medium transition-colors`}
                  >
                    İptal
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-6 py-3 rounded-lg ${
                      theme === 'dark' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                  >
                    {submitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-5 h-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                        Gönderiliyor...
                      </div>
                    ) : (
                      'Talebi Oluştur'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 