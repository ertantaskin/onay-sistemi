import { Metadata } from 'next';
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from '@/app/ClientLayout';
import { getPageMetadata } from './components/MetadataProvider';

const inter = Inter({ subsets: ["latin"] });

// Ana sayfa için metadata oluşturucu - "/" yolunu kullanır
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/');
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
