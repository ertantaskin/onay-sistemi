'use client';

import { Fragment } from 'react';
import { useTheme } from '@/app/ThemeContext';
import dynamic from 'next/dynamic';
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
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';

const Popover = dynamic(
  () => import('@headlessui/react').then((mod) => mod.Popover),
  { ssr: false }
);

const Transition = dynamic(
  () => import('@headlessui/react').then((mod) => mod.Transition),
  { ssr: false }
);

const products = [
  {
    name: 'Kredi Yükle',
    description: 'Hesabınıza kredi yükleyerek onay işlemlerinizi gerçekleştirin',
    href: '/credit',
    icon: CreditCardIcon,
  },
  {
    name: 'Destek Al',
    description: 'Sorularınız için destek ekibimizle iletişime geçin',
    href: '/support',
    icon: QuestionMarkCircleIcon,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Popover className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} shadow-lg`}>
      {({ open }) => (
        <>
          <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <Image
                  className="h-8 w-auto sm:h-10"
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  priority
                />
                <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
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
                <Popover className="relative">
                  <Popover.Button className={`flex items-center gap-x-1 text-sm font-semibold leading-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-600'}`}>
                    Kredi İşlemleri
                    <CurrencyDollarIcon className="h-5 w-5" aria-hidden="true" />
                  </Popover.Button>

                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className={`absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 transform px-2 sm:px-0 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative grid gap-6 px-5 py-6 sm:gap-8 sm:p-8">
                          {products.map((item) => (
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
                      </div>
                    </Popover.Panel>
                  </Transition>
                </Popover>
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
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                    {session.user?.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-x-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Çıkış Yap
                  </button>
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
                      <Link
                        href="/"
                        className={`-m-3 flex items-center rounded-md p-3 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-50'}`}
                      >
                        <HomeIcon className={`h-6 w-6 flex-shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                        <span className="ml-3 text-base font-medium">Ana Sayfa</span>
                      </Link>

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
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                      {session?.user?.email}
                    </span>
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