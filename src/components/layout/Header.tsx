'use client';

import { Fragment, useState } from 'react';
import { useTheme } from '@/app/ThemeContext';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  CreditCardIcon,
  UserPlusIcon,
  KeyIcon,
  ClockIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

const products = [
  { name: 'Kredi Yükle', description: 'Bakiye yükleyerek hemen işlem yapın', href: '/credits', icon: CreditCardIcon },
  { name: 'Kredi Geçmişi', description: 'Geçmiş işlemlerinizi görüntüleyin', href: '/credits/history', icon: ClockIcon },
  { name: 'Kupon Kodları', description: 'Promosyon kodlarını kullanın', href: '/credits/coupons', icon: KeyIcon },
];

const callsToAction = [
  { name: 'Destek Al', href: '/support', icon: QuestionMarkCircleIcon },
  { name: 'Güvenlik', href: '/security', icon: ShieldCheckIcon },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} shadow-lg`}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xl font-bold">Microsoft Onay</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Ana menüyü aç</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <Popover.Group className="hidden lg:flex lg:gap-x-12">
          <Link href="/" className="text-sm font-semibold leading-6">
            Ana Sayfa
          </Link>
          {session && (
            <Popover className="relative">
              <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6">
                Kredi İşlemleri
                <ChevronDownIcon className="h-5 w-5 flex-none" aria-hidden="true" />
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
                <Popover.Panel className={`absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg ring-1 ring-gray-900/5`}>
                  <div className="p-4">
                    {products.map((item) => (
                      <div
                        key={item.name}
                        className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-100 ${
                          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                          <item.icon className="h-6 w-6 text-blue-500 group-hover:text-blue-600" aria-hidden="true" />
                        </div>
                        <div className="flex-auto">
                          <Link href={item.href} className="block font-semibold">
                            {item.name}
                            <span className="absolute inset-0" />
                          </Link>
                          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={`grid grid-cols-2 divide-x divide-gray-900/5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    {callsToAction.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 ${
                          theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                        }`}
                      >
    <SessionProvider>
      <header className={`fixed top-0 left-0 right-0 z-50 ${theme === 'dark' ? 'bg-gray-800/95 backdrop-blur-sm' : 'bg-white/95 backdrop-blur-sm'} shadow-lg`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xl font-bold">Microsoft Onay</span>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Ana menüyü aç</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <Popover.Group className="hidden lg:flex lg:gap-x-12">
            <Link href="/" className="text-sm font-semibold leading-6">
              Ana Sayfa
            </Link>
            {session && (
              <Popover className="relative">
                <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6">
                  Kredi İşlemleri
                  <ChevronDownIcon className="h-5 w-5 flex-none" aria-hidden="true" />
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
                  <Popover.Panel className={`absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg ring-1 ring-gray-900/5`}>
                    <div className="p-4">
                      {products.map((item) => (
                        <div
                          key={item.name}
                          className={`group relative flex items-center gap-x-6 rounded-lg p-4 text-sm leading-6 hover:bg-gray-100 ${
                            theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                            <item.icon className="h-6 w-6 text-blue-500 group-hover:text-blue-600" aria-hidden="true" />
                          </div>
                          <div className="flex-auto">
                            <Link href={item.href} className="block font-semibold">
                              {item.name}
                              <span className="absolute inset-0" />
                            </Link>
                            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className={`grid grid-cols-2 divide-x divide-gray-900/5 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      {callsToAction.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 ${
                            theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                          }`}
                        >
                          <item.icon className="h-5 w-5 flex-none text-blue-500" aria-hidden="true" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </Popover.Panel>
                </Transition>
              </Popover>
            )}

            <Link href="/about" className="text-sm font-semibold leading-6">
              Hakkında
            </Link>
            <Link href="/contact" className="text-sm font-semibold leading-6">
              İletişim
            </Link>
          </Popover.Group>
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
                <span className="text-sm font-medium">{session.user?.email}</span>
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
        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className={`fixed inset-y-0 right-0 z-10 w-full overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10`}>
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center space-x-2">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-xl font-bold">Microsoft Onay</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Menüyü kapat</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Link
                    href="/"
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Ana Sayfa
                  </Link>
                  {session && (
                    <Disclosure as="div" className="-mx-3">
                      {({ open }) => (
                        <>
                          <Disclosure.Button className={`flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base font-semibold leading-7 ${
                            theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}>
                            Kredi İşlemleri
                            <ChevronDownIcon
                              className={classNames(open ? 'rotate-180' : '', 'h-5 w-5 flex-none')}
                              aria-hidden="true"
                            />
                          </Disclosure.Button>
                          <Disclosure.Panel className="mt-2 space-y-2">
                            {[...products, ...callsToAction].map((item) => (
                              <Disclosure.Button
                                key={item.name}
                                as="a"
                                href={item.href}
                                className={`block rounded-lg py-2 pl-6 pr-3 text-sm font-semibold leading-7 ${
                                  theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-x-3">
                                  <item.icon className="h-5 w-5 text-blue-500" />
                                  {item.name}
                                </div>
                              </Disclosure.Button>
                            ))}
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  )}
                  <Link
                    href="/about"
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Hakkında
                  </Link>
                  <Link
                    href="/contact"
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                      theme === 'dark' ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    İletişim
                  </Link>
                </div>
                <div className="py-6">
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-center gap-x-2.5 p-3 text-sm font-semibold leading-6 ${
                      theme === 'dark' 
                        ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } rounded-lg mb-2 transition-all duration-200`}
                  >
                    {theme === 'dark' ? (
                      <>
                        <SunIcon className="h-5 w-5 text-yellow-400" />
                        <span>Açık Temaya Geç</span>
                      </>
                    ) : (
                      <>
                        <MoonIcon className="h-5 w-5 text-blue-500" />
                        <span>Koyu Temaya Geç</span>
                      </>
                    )}
                  </button>
                  {session ? (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-center mb-2">{session.user?.email}</div>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-x-2.5 rounded-lg bg-red-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-600 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Çıkış Yap
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/auth/login"
                        className="w-full flex items-center justify-center gap-x-2.5 rounded-lg bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 transition-all duration-200"
                      >
                        <UserIcon className="h-5 w-5" />
                        Giriş Yap
                      </Link>
                      <Link
                        href="/auth/register"
                        className="w-full flex items-center justify-center gap-x-2.5 rounded-lg bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-600 transition-all duration-200"
                      >
                        <UserPlusIcon className="h-5 w-5" />
                        Kayıt Ol
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </SessionProvider>
  );
} 