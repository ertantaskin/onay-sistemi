'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import AdminMenu from '@/components/admin/AdminMenu';
import { useState } from 'react';

export default function AdminClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Login sayfasında layout'u gösterme
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Oturum kontrolü
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    router.push('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Admin Menu */}
      <AdminMenu />

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 