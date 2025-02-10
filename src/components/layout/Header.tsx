'use client';

import { Fragment, useEffect } from 'react';
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
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useCreditStore } from '@/store/creditStore';

const products = [
  {
    name: 'Onay Numarası Al',
    description: 'IID numaranızı girerek hemen onay numaranızı alın',
    href: '/dashboard/approvals/new',
    icon: CheckCircleIcon,
    highlight: true,
    highlightColor: 'green',
  },
  {
    name: 'Onay Geçmişi',
    description: 'Geçmiş onay işlemlerinizi görüntüleyin',
    href: '/dashboard/approvals/history',
    icon: ClockIcon,
  },
  {
    name: 'Kredi Yükle',
    description: 'Hesabınıza kredi yükleyerek onay işlemlerinizi gerçekleştirin',
    href: '/dashboard/credits/add',
    icon: CreditCardIcon,
    highlight: true,
    highlightColor: 'blue',
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
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { credit, updateCredit } = useCreditStore();

  useEffect(() => {
    if (session) {
      updateCredit();
    }
  }, [session, updateCredit]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Popover className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} shadow-lg`}>
      {({ open }) => (
        <>
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 opacity-25 group-hover:opacity-50 blur transition duration-200"></div>
                  <div className={`relative p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ring-1 ring-gray-900/5 shadow-xl`}>
                    <svg className={`w-6 h-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <span className={`text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-blue-400 to-blue-600' 
                    : 'from-blue-600 to-blue-800'
                }`}>
                  Microsoft Onay
                </span>
              </Link>
            </div>

            <div className="flex lg:hidden">
              <Popover.Button className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="sr-only">Menüyü aç</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </Popover.Button>
            </div>

            <div className="hidden lg:flex lg:gap-x-12">
              <Link href="/" className={`text-sm font-semibold leading-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-600'}`}>
                Ana Sayfa
              </Link>

              {session && (
                <div className="relative group">
                  <button className={`flex items-center gap-x-1 text-sm font-semibold leading-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-600'}`}>
                    Onay İşlemleri
                    <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                  </button>

                  <div className={`absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className={`relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                        {products.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={`-m-3 flex items-start rounded-lg p-3 transition-all duration-200 ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700' 
                                : 'hover:bg-gray-50'
                            } ${
                              item.highlight
                                ? item.highlightColor === 'blue'
                                  ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 ring-1 ring-blue-500/20 dark:ring-blue-400/20'
                                  : 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 ring-1 ring-green-500/20 dark:ring-green-400/20'
                                : ''
                            }`}
                          >
                            <item.icon 
                              className={`h-6 w-6 flex-shrink-0 ${
                                item.highlight
                                  ? item.highlightColor === 'blue'
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-green-600 dark:text-green-400'
                                  : theme === 'dark'
                                    ? 'text-blue-400'
                                    : 'text-blue-600'
                              }`}
                              aria-hidden="true"
                            />
                            <div className="ml-4">
                              <p className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                                {item.highlight && (
                                  <span className={`ml-2 inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                    item.highlightColor === 'blue'
                                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                      : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                  }`}>
                                    Önerilen
                                  </span>
                                )}
                              </p>
                              <p className={`mt-1 text-sm ${
                                item.highlight
                                  ? item.highlightColor === 'blue'
                                    ? 'text-blue-600 dark:text-blue-300'
                                    : 'text-green-600 dark:text-green-300'
                                  : theme === 'dark'
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Link href="/about" className={`text-sm font-semibold leading-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-600'}`}>
                Hakkında
              </Link>
            </div>

            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {session ? (
                <div className="flex items-center gap-x-4">
                  <div className="relative group">
                    <button className={`flex items-center gap-x-2 px-4 py-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-200`}>
                      <UserCircleIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                      <div className="flex flex-col items-start">
                        <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                          {session.user?.email}
                        </span>
                        <span className="text-sm text-blue-500 font-semibold">
                          {credit} Kredi
                        </span>
                      </div>
                    </button>

                    <div className={`absolute right-0 z-10 mt-3 w-screen max-w-xs transform px-2 sm:px-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className={`relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                          {userMenuItems.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className={`-m-3 flex items-start rounded-lg p-3 ${
                                theme === 'dark' 
                                  ? 'hover:bg-gray-700' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <item.icon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                              <div className="ml-4">
                                <p className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </p>
                                <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                        <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-5 py-5`}>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Çıkış Yap
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-x-4">
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-x-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                  >
                    <UserIcon className="h-5 w-5" />
                    Giriş Yap
                  </Link>
                  <Link
                    href="/auth/register"
                    className="flex items-center gap-x-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    Kayıt Ol
                  </Link>
                </div>
              )}
            </div>
          </nav>

          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel focus className={`absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className={`rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="px-5 pt-4 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Image
                        className="h-8 w-auto"
                        src="/logo.png"
                        alt="Logo"
                        width={32}
                        height={32}
                        priority
                      />
                    </div>
                    <div className="-mr-2">
                      <Popover.Button className={`inline-flex items-center justify-center rounded-md p-2 ${theme === 'dark' ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-500' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-500'}`}>
                        <span className="sr-only">Menüyü kapat</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>
                  <div className="mt-6">
                    <nav className="grid gap-y-4">
                      {session && (
                        <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-6 w-6 text-blue-500" />
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                                {session.user?.email}
                              </p>
                              <p className="text-sm text-blue-500 font-semibold">
                                {credit} Kredi
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Link
                        href="/"
                        className={`-m-3 flex items-center rounded-md p-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}`}
                      >
                        <HomeIcon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                        <span className="ml-3 text-base font-medium">Ana Sayfa</span>
                      </Link>

                      {session && userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`-m-3 flex items-center rounded-md p-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          <item.icon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                          <span className="ml-3 text-base font-medium">{item.name}</span>
                        </Link>
                      ))}

                      {session && products.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`-m-3 flex items-center rounded-md p-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}`}
                        >
                          <item.icon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                          <span className="ml-3 text-base font-medium">{item.name}</span>
                        </Link>
                      ))}

                      <Link
                        href="/about"
                        className={`-m-3 flex items-center rounded-md p-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}`}
                      >
                        <InformationCircleIcon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                        <span className="ml-3 text-base font-medium">Hakkında</span>
                      </Link>
                    </nav>
                  </div>
                </div>
                <div className={`px-5 py-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={toggleTheme}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-gray-600 text-yellow-400 hover:bg-gray-500' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {theme === 'dark' ? (
                        <SunIcon className="h-5 w-5" />
                      ) : (
                        <MoonIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {session ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Çıkış Yap
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
                        >
                          <UserIcon className="h-5 w-5" />
                          Giriş Yap
                        </Link>
                        <Link
                          href="/auth/register"
                          className="w-full flex items-center justify-center gap-x-2 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600"
                        >
                          <UserPlusIcon className="h-5 w-5" />
                          Kayıt Ol
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
} 