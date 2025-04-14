import { Metadata } from 'next';
import AdminClientLayout from '@/app/admin/AdminClientLayout';

// Metadata tanımı
export const metadata: Metadata = {
  title: 'Admin Paneli | Microsoft Onay Sistemi',
  description: 'Microsoft Onay Sistemi yönetici kontrol paneli',
  robots: 'noindex, nofollow'
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminClientLayout>{children}</AdminClientLayout>;
} 