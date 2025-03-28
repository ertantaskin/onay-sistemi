'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  MessageSquareText,
  Send,
  User,
  Headphones,
  Calendar,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

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
  const { data: session, status: sessionStatus } = useSession();
  const { theme } = useTheme();

  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    loadTicket();
  }, [ticketId, session, sessionStatus]);

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
        return <AlertTriangle className="h-4 w-4 mr-1.5" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 mr-1.5" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 mr-1.5" />;
      default:
        return <AlertTriangle className="h-4 w-4 mr-1.5" />;
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

  if (loading && sessionStatus !== 'loading') {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">Destek talebi yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <MessageSquareText className="h-16 w-16 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Destek talebi bulunamadı</h1>
          <button
            onClick={() => router.push('/dashboard/support')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white font-medium transition-colors`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Geri Dön
          </button>
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
              {ticket.subject}
            </h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              Destek talebi detayları ve mesajlaşma
            </p>
          </div>
        </div>
      </div>

      {/* Geri Dön Butonu */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard/support')}
          className={`flex items-center text-sm ${
            theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          } transition-colors`}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Destek Taleplerine Geri Dön
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon - Dashboard Sidebar */}
        <div className="lg:col-span-3">
          <DashboardSidebar />
        </div>

        {/* Sağ Kolon - Destek Talebi Detayları */}
        <div className="lg:col-span-9 space-y-6">
          {/* Üst Bilgi Kartı */}
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquareText className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-semibold">Talep Bilgileri</h2>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {getStatusIcon(ticket.status)}
                  {getStatusText(ticket.status)}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Tag className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Kategori:</span>
                    <span className="ml-2 font-medium">{ticket.category.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Oluşturma Tarihi:</span>
                    <span className="ml-2 font-medium">{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Kullanıcı:</span>
                    <span className="ml-2 font-medium">{ticket.user.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MessageSquareText className="h-4 w-4 mr-2 text-gray-400" />
                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>Mesaj Sayısı:</span>
                    <span className="ml-2 font-medium">{ticket.messages.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mesajlaşma Alanı */}
          <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-2">
                <MessageSquareText className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Mesajlar</h2>
              </div>
            </div>
            
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
                          <div className={`p-2 rounded-full ${
                            theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-100'
                          }`}>
                            <Headphones className="h-6 w-6 text-blue-500" />
                          </div>
                        ) : (
                          <div className={`p-2 rounded-full ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                          }`}>
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className={`rounded-2xl px-4 py-2 ${
                          message.isStaff
                            ? theme === 'dark' 
                              ? 'bg-blue-900/20 text-blue-100' 
                              : 'bg-blue-50 text-blue-900'
                            : theme === 'dark' 
                              ? 'bg-gray-700 text-gray-100' 
                              : 'bg-gray-50 text-gray-900'
                        }`}>
                          <div className="text-sm mb-1 font-medium">
                            {message.isStaff ? 'Destek Ekibi' : message.user.name || 'Siz'}
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        </div>
                        <div className={`text-xs mt-1 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        } ${message.isStaff ? 'text-left' : 'text-right'}`}>
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
            <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-4`}>
              <form onSubmit={handleSendMessage} className="flex items-end gap-4">
                <div className="flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className={`w-full p-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-400 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:border-transparent resize-none`}
                    rows={3}
                    disabled={ticket.status === 'closed'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !message.trim() || ticket.status === 'closed'}
                  className={`flex items-center justify-center h-12 w-12 rounded-lg ${
                    theme === 'dark' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {sending ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </form>
              {ticket.status === 'closed' && (
                <p className={`mt-2 text-sm text-center text-red-500`}>
                  Bu destek talebi kapatılmış. Yeni bir mesaj gönderilemez.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 