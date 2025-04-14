import { Metadata } from 'next';

// Metadata tanımı
export const metadata: Metadata = {
  title: 'SEO Ayarları - Admin Paneli | Microsoft Onay Sistemi',
  description: 'Microsoft Onay Sistemi admin paneli SEO ayarları yönetim sayfası',
  robots: 'noindex, nofollow'
};

export default function SeoSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 