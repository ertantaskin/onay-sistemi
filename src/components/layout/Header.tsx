'use client';

import { Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/app/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navigation = [
    { name: 'Ana Sayfa', href: '/', current: pathname === '/' },
    ...(session ? [
      { name: 'Panel', href: '/dashboard', current: pathname === '/dashboard' },
      { name: 'Onay Al', href: '/dashboard/approvals/new', current: pathname === '/dashboard/approvals/new' },
      { name: 'Kredi Yükle', href: '/dashboard/credits/add', current: pathname === '/dashboard/credits/add' },
    ] : []),
  ];

  const userNavigation = [
    { name: 'Profilim', href: '/dashboard/profile' },
    { name: 'Onay Geçmişi', href: '/dashboard/approvals/history' },
    { name: 'Kredi Geçmişi', href: '/dashboard/credits/history' },
    { name: 'Kupon Kullan', href: '/dashboard/credits/coupon' },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <Disclosure as="nav" className={`fixed w-full z-50 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow`}>
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/">
                    <img
                      className="h-8 w-auto"
                      src="/logo.png"
                      alt="Logo"
                    />
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? `${theme === 'dark' ? 'border-blue-500 text-white' : 'border-blue-500 text-gray-900'}`
                          : `${theme === 'dark' ? 'text-gray-300 hover:border-gray-300' : 'text-gray-500 hover:border-gray-300'}`,
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                {/* Tema Değiştirme Butonu */}
                <button
                  onClick={toggleTheme}
                  className={`rounded-full p-1 ${
                    theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {theme === 'dark' ? (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>

                {/* Profil Menüsü */}
                {session ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className={`flex rounded-full text-sm focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <span className="sr-only">Kullanıcı menüsü</span>
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {session.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className={`absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg focus:outline-none ${theme === 'dark' ? 'bg-gray-700' : 'bg-white'} ring-1 ring-black ring-opacity-5`}>
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  active ? `${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}` : '',
                                  `block px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={classNames(
                                active ? `${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-100'}` : '',
                                `block w-full text-left px-4 py-2 text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`
                              )}
                            >
                              Çıkış Yap
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className={`text-sm font-medium ${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'}`}
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/auth/register"
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobil Menü Butonu */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className={`inline-flex items-center justify-center rounded-md p-2 ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}>
                  <span className="sr-only">Ana menüyü aç</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobil Menü */}
          <Disclosure.Panel className="sm:hidden">
            <div className={`space-y-1 pb-3 pt-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? `${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-blue-50 text-blue-700'}`
                      : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`,
                    'block px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {session && (
              <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} pb-3 pt-4`}>
                <div className="flex items-center px-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {session.user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                      {session.user?.name}
                    </div>
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      {session.user?.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className={`block px-4 py-2 text-base font-medium ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={handleSignOut}
                    className={`block w-full text-left px-4 py-2 text-base font-medium ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  >
                    Çıkış Yap
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 