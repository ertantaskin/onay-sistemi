'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiArrowLeft, HiPaperAirplane, HiUser, HiUserCircle } from 'react-icons/hi2';
import { HiSupport } from 'react-icons/hi';

interface Message {
  id: string;
  message: string;
  isStaff: boolean;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  category: {
    name: string;
  };
  messages: Message[];
}

interface TicketDetailProps {
  ticketId: string;
}

export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);
      setTicket(data);
    } catch (error) {
      toast.error('Destek talebi yüklenirken hata oluştu');
      router.push('/dashboard/support');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage('');
      loadTicket();
      toast.success('Mesaj gönderildi');
    } catch (error) {
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Destek talebi bulunamadı
        </h1>
        <button
          onClick={() => router.push('/dashboard/support')}
          className="flex items-center text-blue-500 hover:text-blue-600"
        >
          <HiArrowLeft className="h-5 w-5 mr-2" />
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Üst Bilgi Kartı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard/support')}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <HiArrowLeft className="h-5 w-5 mr-2" />
              Geri Dön
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(ticket.status)}`}>
              {getStatusText(ticket.status)}
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {ticket.subject}
          </h1>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Kategori</p>
              <p className="font-medium text-gray-900 dark:text-white">{ticket.category.name}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Oluşturulma Tarihi</p>
              <p className="font-medium text-gray-900 dark:text-white">{formatDate(ticket.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mesajlaşma Alanı */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="h-[500px] overflow-y-auto p-6">
          <div className="space-y-6">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isStaff ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start max-w-[80%] ${message.isStaff ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`flex-shrink-0 ${message.isStaff ? 'mr-3' : 'ml-3'}`}>
                    {message.isStaff ? (
                      <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                        <HiSupport className="h-6 w-6 text-blue-600 dark:text-blue-200" />
                      </div>
                    ) : (
                      <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                        <HiUser className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className={`rounded-2xl px-4 py-2 ${
                      message.isStaff
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                    }`}>
                      <div className="text-sm mb-1 font-medium">
                        {message.isStaff ? 'Destek Ekibi' : message.user.name || 'Siz'}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    </div>
                    <div className={`text-xs mt-1 text-gray-500 ${message.isStaff ? 'text-left' : 'text-right'}`}>
                      {formatDate(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Mesaj Gönderme Formu */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSendMessage} className="flex items-end gap-4">
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                disabled={ticket.status === 'closed'}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !message.trim() || ticket.status === 'closed'}
              className="flex items-center justify-center h-12 px-6 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <HiPaperAirplane className="h-5 w-5" />
              )}
            </button>
          </form>
          {ticket.status === 'closed' && (
            <p className="mt-2 text-sm text-center text-red-500">
              Bu destek talebi kapatılmış. Yeni bir mesaj gönderilemez.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 