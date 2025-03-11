'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./ThemeContext";
import { SessionProvider } from "next-auth/react";
import { SessionTimeout } from '@/components/SessionTimeout';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
          <ThemeProvider>
            <SessionTimeout />
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
