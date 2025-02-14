'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import SupportHeader from '@/components/support/SupportHeader';

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

  useEffect(() => {
    if (categoryId) {
      loadCategory(categoryId);
    }
  }, [categoryId]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5 mr-2" />
          Geri Dön
        </button>
      </div>

      <SupportHeader 
        title={category ? `Yeni Talep - ${category.name}` : 'Yeni Talep'}
        description={category?.description || 'Lütfen talep detaylarını doldurun'}
      />

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Konu
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base transition-colors duration-200"
              placeholder="Talebinizin konusunu girin"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Öncelik
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'normal' | 'high' })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base transition-colors duration-200"
            >
              <option value="low">Düşük</option>
              <option value="normal">Normal</option>
              <option value="high">Yüksek</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="message" className="block text-base font-medium text-gray-700 dark:text-gray-200">
              Mesaj
            </label>
            <textarea
              id="message"
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-base transition-colors duration-200 resize-none"
              placeholder="Talebinizin detaylarını açıklayın"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Link
              href="/dashboard/support"
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors duration-200"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {submitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
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
  );
} 