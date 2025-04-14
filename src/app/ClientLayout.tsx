'use client';

import { ThemeProvider } from "./ThemeContext";
import { SessionProvider } from "next-auth/react";
import { SessionTimeout } from '@/components/SessionTimeout';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <ThemeProvider>
        <SessionTimeout />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
} 