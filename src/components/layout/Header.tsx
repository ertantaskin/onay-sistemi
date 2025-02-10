'use client';

import { Fragment, useEffect, useState } from 'react';
import { useTheme } from '@/app/ThemeContext';
import { Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  HomeIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  UserCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useCreditStore } from '@/store/creditStore';
import { useRouter, usePathname } from 'next/navigation';

const products = [
  {
    name: 'Kredi Yükle',
    description: 'Hesabınıza kredi yükleyerek onay işlemlerinizi gerçekleştirin',
    href: '/dashboard/credits/add',
    icon: CreditCardIcon,
  },
  {
    name: 'Destek Al',
    description: 'Sorularınız için destek ekibimizle iletişime geçin',
    href: '/support',
    icon: QuestionMarkCircleIcon,
  },
];

const userMenuItems = [
  {
    name: 'Müşteri Paneli',
    description: 'Genel bakış ve istatistikler',
    href: '/dashboard',
    icon: ChartBarIcon,
  },
  {
    name: 'Profil Bilgileri',
    description: 'Hesap ayarlarınızı düzenleyin',
    href: '/dashboard/profile',
    icon: UserCircleIcon,
  },
  {
    name: 'Kredi Yükle',
    description: 'Bakiyenizi artırın',
    href: '/dashboard/credits/add',
    icon: CreditCardIcon,
  },
  {
    name: 'Onay Geçmişi',
    description: 'Geçmiş işlemlerinizi görüntüleyin',
    href: '/dashboard/approvals/history',
    icon: ClockIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const { credit, updateCredit } = useCreditStore();

  useEffect(() => {
    if (session) {
      updateCredit();
    }
  }, [session, updateCredit]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' });
  };

  const navigation = [
    { name: 'Ana Sayfa', href: '/dashboard' },
    {
      name: 'Onay İşlemleri',
      items: [
        { name: 'Yeni Onay Al', href: '/dashboard/approvals/new' },
        { name: 'Onay Geçmişi', href: '/dashboard/approvals/history' },
      ],
    },
    {
      name: 'Kredi İşlemleri',
      items: [
        { name: 'Kredi Yükle', href: '/dashboard/credits/add' },
        { name: 'Kredi Geçmişi', href: '/dashboard/credits/history' },
      ],
    },
  ];

  return (
    <header className="fixed w-full top-0 z-50">
      <nav className={`${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link href="/dashboard" className="flex items-center">
                  <div className="relative group">
                    <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-blue-600/20 to-blue-400/20 group-hover:from-blue-600/30 group-hover:to-blue-400/30 blur-lg transition-all duration-300"></div>
                    <div className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'
                    } backdrop-blur-sm ring-1 ring-gray-900/5 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                      <div className="relative p-1 rounded-md bg-gradient-to-br from-blue-500/10 to-blue-400/10">
                        <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} transform group-hover:rotate-12 transition-transform duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className={`text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                        theme === 'dark' 
                          ? 'from-blue-400 to-blue-600' 
                          : 'from-blue-600 to-blue-800'
                      } drop-shadow-sm`}>
                        Microsoft Onay
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  item.items ? (
                    <div
                      key={item.name}
                      className="relative"
                      onMouseEnter={() => setHoveredMenu(item.name)}
                      onMouseLeave={() => setHoveredMenu(null)}
                    >
                      <button
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                          hoveredMenu === item.name
                            ? theme === 'dark'
                              ? 'text-white border-b-2 border-blue-500'
                              : 'text-gray-900 border-b-2 border-blue-500'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:text-white'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {item.name}
                        <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${hoveredMenu === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {hoveredMenu === item.name && (
                        <div className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                                theme === 'dark'
                                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${
                        pathname === item.href
                          ? theme === 'dark'
                            ? 'text-white border-b-2 border-blue-500'
                            : 'text-gray-900 border-b-2 border-blue-500'
                          : theme === 'dark'
                          ? 'text-gray-300 hover:text-white'
                          : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              <div className="relative" onMouseEnter={() => setHoveredMenu('profile')} onMouseLeave={() => setHoveredMenu(null)}>
                <button
                  type="button"
                  className={`flex items-center space-x-3 rounded-lg p-2 transition-colors duration-200 ${
                    hoveredMenu === 'profile'
                      ? theme === 'dark'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-900'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="sr-only">Kullanıcı menüsü</span>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                      {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:flex md:flex-col md:items-start">
                      <span className="text-sm font-medium">
                        {session?.user?.name || session?.user?.email}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {session?.user?.credit || 0} Kredi
                      </span>
                    </div>
                  </div>
                  <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${hoveredMenu === 'profile' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {hoveredMenu === 'profile' && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {session?.user?.email}
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      Profil Ayarları
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center sm:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="sr-only">Ana menüyü aç</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil menü */}
        <div className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className={`pt-2 pb-3 space-y-1 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            {navigation.map((item) => (
              item.items ? (
                <div key={item.name}>
                  <button
                    onClick={() => setHoveredMenu(hoveredMenu === item.name ? null : item.name)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-base font-medium ${
                      hoveredMenu === item.name
                        ? theme === 'dark'
                          ? 'text-white bg-gray-800'
                          : 'text-gray-900 bg-gray-100'
                        : theme === 'dark'
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {item.name}
                    <svg className={`ml-2 h-4 w-4 transition-transform duration-200 ${hoveredMenu === item.name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {hoveredMenu === item.name && (
                    <div className="pl-4">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block px-4 py-2 text-base font-medium ${
                            theme === 'dark'
                              ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2 text-base font-medium ${
                    pathname === item.href
                      ? theme === 'dark'
                        ? 'text-white bg-gray-800'
                        : 'text-gray-900 bg-gray-100'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>
          <div className={`pt-4 pb-3 border-t ${theme === 'dark' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-medium">
                  {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-white">
                  {session?.user?.name || session?.user?.email}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {session?.user?.credit || 0} Kredi
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`ml-auto p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {theme === 'dark' ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/dashboard/profile"
                className={`block px-4 py-2 text-base font-medium ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => setIsOpen(false)}
              >
                Profil Ayarları
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className={`block w-full text-left px-4 py-2 text-base font-medium ${
                  theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
} 