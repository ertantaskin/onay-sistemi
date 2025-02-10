'use client';

import { useTheme } from '@/app/ThemeContext';
import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  const { theme } = useTheme();
  
  const navigation = {
    main: [
      { name: 'Ana Sayfa', href: '/' },
      { name: 'Hakkında', href: '/about' },
      { name: 'Destek', href: '/support' },
      { name: 'Gizlilik', href: '/privacy' },
    ],
    social: [
      {
        name: 'GitHub',
        href: 'https://github.com/ertantaskin/onay-sistemi',
        icon: (props: any) => (
          <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
        ),
      },
    ],
  };

  return (
    <footer className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 opacity-25 group-hover:opacity-50 blur transition duration-200"></div>
            <div className={`relative flex items-center space-x-3 px-4 py-3 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            } ring-1 ring-gray-900/5 shadow-xl`}>
              <div className="p-2">
                <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                theme === 'dark' 
                  ? 'from-blue-400 to-blue-600' 
                  : 'from-blue-600 to-blue-800'
              }`}>
                Microsoft Onay
              </span>
            </div>
          </div>
        </div>
        
        <nav className="mt-8 flex justify-center space-x-6" aria-label="Footer">
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm leading-6 transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-8 flex justify-center space-x-10">
          {navigation.social.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`transition-all duration-200 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>

        <p className={`mt-8 text-center text-xs leading-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          &copy; {new Date().getFullYear()} Microsoft Onay. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
} 