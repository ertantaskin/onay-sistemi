'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/ThemeContext';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { Toaster } from "react-hot-toast";
import { IIDForm } from '@/components/forms/IIDForm';
import { RecentApprovals } from '@/components/dashboard/RecentApprovals';
import { CheckCircle } from "lucide-react";

export default function NewApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

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
              <CheckCircle className="h-12 w-12 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Yeni Onay Al</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                IID numaranızı girerek hemen onay numaranızı alabilirsiniz
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sol Kolon - Dashboard Sidebar */}
          <div className="lg:col-span-3">
            <DashboardSidebar />
          </div>

          {/* Sağ Kolon - Onay Formu ve Son Onaylar */}
          <div className="lg:col-span-9 space-y-8">
            {/* Onay Formu */}
            <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden`}>
              <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <CheckCircle className="h-5 w-5 mr-2 text-blue-500" />
                  IID Onay İşlemi
                </h2>
              </div>
              
              <div className="p-6">
                <div className="text-center mb-8">
                  <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    IID numaranızı girerek hemen onay numaranızı alabilirsiniz.
                  </p>
                </div>
                <IIDForm />
              </div>
            </div>
            
            {/* Son Onaylar */}
            <RecentApprovals />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
} 