'use client';

import { Fragment } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useTheme } from '@/app/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';

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

  return (
    <Disclosure as="nav" className="fixed w-full top-0 z-50 bg-white dark:bg-gray-800 shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Microsoft Onay
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'border-blue-500 text-gray-900 dark:text-white'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white',
                        'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button
                  onClick={toggleTheme}
                  className="rounded-full bg-white dark:bg-gray-700 p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MoonIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>

                {session ? (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {session.user?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            {session.user?.name}
                          </span>
                        </div>
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  active ? 'bg-gray-100 dark:bg-gray-600' : '',
                                  'block px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
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
                              onClick={() => signOut()}
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-600' : '',
                                'block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
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
                  <div className="ml-6 flex items-center space-x-4">
                    <Link
                      href="/auth/login"
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-medium"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      href="/auth/register"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}
              </div>
              <div className="-mr-2 flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-700 dark:text-blue-200'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
                    'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            {session ? (
              <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-4">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {session.user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800 dark:text-white">{session.user?.name}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{session.user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      href={item.href}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={() => signOut()}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Çıkış Yap
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-700 pb-3 pt-4 px-4 space-y-2">
                <Link
                  href="/auth/login"
                  className="block text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white text-base font-medium"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="block bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-base font-medium text-center"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 