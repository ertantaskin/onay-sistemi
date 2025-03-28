'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 dakika
const WARNING_TIME = 5 * 60 * 1000; // 5 dakika
const CHECK_INTERVAL = 10 * 1000; // 10 saniye

export function SessionTimeout() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Oturum kontrolü
  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();

      if (!data || !data.user) {
        // Oturum sonlandıysa
        toast.error('Oturumunuz sonlandı. Giriş sayfasına yönlendiriliyorsunuz.');
        await signOut({ redirect: false });
        router.push('/auth/login');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Oturum kontrol hatası:', error);
      return false;
    }
  }, [router]);

  // Korumalı sayfa kontrolü
  const isProtectedPage = useCallback(() => {
    return pathname?.startsWith('/dashboard') || 
           pathname?.startsWith('/admin');
  }, [pathname]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session && isProtectedPage()) {
      router.push('/auth/login');
      return;
    }

    let warningTimeout: NodeJS.Timeout;
    let logoutTimeout: NodeJS.Timeout;
    let checkSessionInterval: NodeJS.Timeout;

    const resetTimers = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);

      warningTimeout = setTimeout(() => {
        setShowWarning(true);
      }, IDLE_TIMEOUT - WARNING_TIME);

      logoutTimeout = setTimeout(async () => {
        await signOut({ redirect: false });
        toast.error('Oturum zaman aşımına uğradı. Lütfen tekrar giriş yapın.');
        router.push('/auth/login');
      }, IDLE_TIMEOUT);
    };

    const handleActivity = () => {
      resetTimers();
    };

    // Aktivite olaylarını dinle
    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    // Olay dinleyicilerini ekle
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Periyodik oturum kontrolü
    checkSessionInterval = setInterval(async () => {
      if (isProtectedPage()) {
        const isSessionValid = await checkSession();
        if (!isSessionValid) {
          clearInterval(checkSessionInterval);
        }
      }
    }, CHECK_INTERVAL);

    // İlk zamanlayıcıları başlat
    resetTimers();

    // Temizleme işlemi
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
      clearInterval(checkSessionInterval);
    };
  }, [session, router, status, checkSession, isProtectedPage]);

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-lg shadow-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Oturumunuz yakında sona erecek. Devam etmek istiyor musunuz?
            </p>
          </div>
          <div className="ml-4 flex space-x-3">
            <button
              onClick={() => {
                setShowWarning(false);
                setLastActivity(Date.now());
              }}
              className="text-sm font-medium text-yellow-700 hover:text-yellow-600 focus:outline-none focus:underline"
            >
              Evet, devam et
            </button>
            <button
              onClick={async () => {
                await signOut({ redirect: false });
                router.push('/auth/login');
              }}
              className="text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:underline"
            >
              Çıkış yap
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 