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
  CheckCircleIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useCreditStore } from '@/store/creditStore';
import { useCartStore } from '@/store/cartStore';

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

interface MiniCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface MiniCart {
  id: string;
  totalPrice: number;
  items: MiniCartItem[];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const { credits, updateCredits } = useCreditStore();
  const { itemCount, updateCartItemCount } = useCartStore();
  const [miniCart, setMiniCart] = useState<MiniCart | null>(null);
  const [loadingMiniCart, setLoadingMiniCart] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);

  useEffect(() => {
    if (session) {
      updateCredits();
      updateCartItemCount();
    }
  }, [session, updateCredits, updateCartItemCount]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const fetchMiniCart = async () => {
    if (!session) return;
    
    try {
      setLoadingMiniCart(true);
      const response = await fetch("/api/store/cart");
      
      if (!response.ok) {
        throw new Error("Sepet yüklenirken bir hata oluştu");
      }
      
      const data = await response.json();
      setMiniCart(data);
    } catch (error) {
      console.error("Mini sepet yüklenirken hata:", error);
    } finally {
      setLoadingMiniCart(false);
    }
  };

  const toggleMiniCart = async () => {
    if (!showMiniCart) {
      await fetchMiniCart();
    }
    setShowMiniCart(!showMiniCart);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
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

              <Link href="/store" className={`text-sm font-semibold leading-6 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-900 hover:text-gray-600'}`}>
                Mağaza
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
              {session && (
                <div className="relative">
                  <button
                    onClick={toggleMiniCart}
                    className={`relative p-2 rounded-lg transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' 
                        : 'bg-gray-100 text-blue-600 hover:bg-gray-200'
                    }`}
                    aria-label="Sepet"
                  >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </button>

                  {/* Mini Sepet */}
                  {showMiniCart && (
                    <div className={`absolute right-0 z-20 mt-3 w-80 transform px-2 sm:px-0 transition-all duration-200`}>
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <h3 className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              Sepetim ({itemCount} ürün)
                            </h3>
                            <button 
                              onClick={() => setShowMiniCart(false)}
                              className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        
                        <div className={`max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                          {loadingMiniCart ? (
                            <div className="flex justify-center items-center py-8">
                              <Loader2 className={`h-8 w-8 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                          ) : miniCart && miniCart.items.length > 0 ? (
                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                              {miniCart.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3">
                                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                    {item.product.imageUrl ? (
                                      <Image
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        fill
                                        className="object-cover object-center"
                                      />
                                    ) : (
                                      <div className={`h-full w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                        <ShoppingBagIcon className={`h-8 w-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                      {item.product.name}
                                    </p>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                      {item.quantity} x {formatPrice(item.price)}
                                    </p>
                                  </div>
                                  <div className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {formatPrice(item.price * item.quantity)}
                                  </div>
                                </div>
                              ))}
                              
                              {miniCart.items.length > 3 && (
                                <div className={`p-3 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  +{miniCart.items.length - 3} diğer ürün
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className={`py-8 px-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Sepetinizde ürün bulunmuyor</p>
                            </div>
                          )}
                        </div>
                        
                        {miniCart && miniCart.items.length > 0 && (
                          <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3`}>
                            <div className="flex justify-between items-center mb-3">
                              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Toplam
                              </span>
                              <span className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatPrice(miniCart.totalPrice)}
                              </span>
                            </div>
                            <Link
                              href="/store/cart"
                              onClick={() => setShowMiniCart(false)}
                              className={`block w-full text-center text-sm font-medium px-4 py-2 rounded-lg 
                                ${theme === 'dark' 
                                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } transition-all duration-200 shadow-sm`}
                            >
                              Sepete Git
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-900'}`}>
                        {session.user?.email}
                      </span>
                    </button>

                    <div className={`absolute right-0 z-10 mt-3 w-screen max-w-xs transform px-2 sm:px-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200`}>
                      <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-5 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                          <div className="flex flex-col gap-3">
                            <div className={`relative overflow-hidden rounded-xl p-4 ${
                              theme === 'dark'
                                ? 'bg-gradient-to-br from-blue-600/20 via-blue-900/30 to-blue-800/20 ring-1 ring-blue-500/20'
                                : 'bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 ring-1 ring-blue-100'
                            }`}>
                              <div className="absolute top-0 left-0 w-full h-full">
                                <div className={`absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] ${theme === 'dark' ? 'opacity-20' : 'opacity-40'}`} />
                                <div className={`absolute inset-0 bg-gradient-to-t ${theme === 'dark' ? 'from-gray-900/20' : 'from-blue-50/20'} to-transparent`} />
                              </div>
                              <div className="relative">
                                <div className="flex justify-between items-center mb-3">
                                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Mevcut Bakiye
                                  </span>
                                  <CurrencyDollarIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex items-baseline gap-1 mb-3">
                                  <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                    {credits}
                                  </span>
                                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    kredi
                                  </span>
                                </div>
                                <Link
                                  href="/dashboard/credits/add"
                                  className={`block w-full text-center text-sm font-medium px-4 py-2 rounded-lg 
                                    ${theme === 'dark' 
                                      ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    } transition-all duration-200 shadow-sm`}
                                >
                                  Kredi Yükle
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
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
                        <div className={`p-5 rounded-xl ${theme === 'dark' ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} shadow-lg ring-1 ring-black/5 backdrop-blur-sm`}>
                          <div className="flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ring-1 ring-black/5 shadow-sm`}>
                              <UserCircleIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'}`}>
                                {session.user?.email}
                              </p>
                              <div className={`flex items-center gap-1.5 mt-0.5`}>
                                <CurrencyDollarIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                <span className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                                  {credits} Kredi
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-between">
                            <div className="relative">
                              <button
                                onClick={toggleMiniCart}
                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg ${
                                  theme === 'dark' 
                                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                } transition-colors duration-200`}
                              >
                                <ShoppingBagIcon className="h-5 w-5" />
                                <span>Sepetim</span>
                                {itemCount > 0 && (
                                  <span className="ml-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {itemCount}
                                  </span>
                                )}
                              </button>

                              {/* Mobil Mini Sepet */}
                              {showMiniCart && (
                                <div className={`absolute left-0 z-20 mt-3 w-72 transform px-2 sm:px-0 transition-all duration-200`}>
                                  <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                                      <div className="flex items-center justify-between">
                                        <h3 className={`text-base font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                          Sepetim ({itemCount} ürün)
                                        </h3>
                                        <button 
                                          onClick={() => setShowMiniCart(false)}
                                          className={`p-1 rounded-full ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                        >
                                          <XMarkIcon className="h-5 w-5" />
                                        </button>
                                      </div>
                                    </div>
                                    
                                    <div className={`max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                                      {loadingMiniCart ? (
                                        <div className="flex justify-center items-center py-8">
                                          <Loader2 className={`h-8 w-8 animate-spin ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                        </div>
                                      ) : miniCart && miniCart.items.length > 0 ? (
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                          {miniCart.items.slice(0, 3).map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-3">
                                              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                                                {item.product.imageUrl ? (
                                                  <Image
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover object-center"
                                                  />
                                                ) : (
                                                  <div className={`h-full w-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                    <ShoppingBagIcon className={`h-6 w-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
                                                  </div>
                                                )}
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                                  {item.product.name}
                                                </p>
                                                <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                  {item.quantity} x {formatPrice(item.price)}
                                                </p>
                                              </div>
                                            </div>
                                          ))}
                                          
                                          {miniCart.items.length > 3 && (
                                            <div className={`p-3 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                              +{miniCart.items.length - 3} diğer ürün
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <div className={`py-8 px-4 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                          <ShoppingBagIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                          <p>Sepetinizde ürün bulunmuyor</p>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {miniCart && miniCart.items.length > 0 && (
                                      <div className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} px-4 py-3`}>
                                        <div className="flex justify-between items-center mb-3">
                                          <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Toplam
                                          </span>
                                          <span className={`text-base font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {formatPrice(miniCart.totalPrice)}
                                          </span>
                                        </div>
                                        <Link
                                          href="/store/cart"
                                          onClick={() => setShowMiniCart(false)}
                                          className={`block w-full text-center text-sm font-medium px-4 py-2 rounded-lg 
                                            ${theme === 'dark' 
                                              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                                            } transition-all duration-200 shadow-sm`}
                                        >
                                          Sepete Git
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <Link
                              href="/dashboard/credits/add"
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                theme === 'dark' 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                  : 'bg-blue-500 text-white hover:bg-blue-600'
                              } transition-colors duration-200`}
                            >
                              <CurrencyDollarIcon className="h-5 w-5" />
                              <span>Kredi Yükle</span>
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className={`space-y-2 pb-4 pt-2 ${theme === 'dark' ? 'border-b border-gray-800' : 'border-b border-gray-100'}`}>
                        <div className="px-3 flex items-center justify-between">
                          <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ana Menü
                          </p>
                          <div className={`h-px flex-grow mx-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                        </div>
                        <div className="space-y-1 px-2">
                          <Link
                            href="/"
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
                              ${theme === 'dark' 
                                ? 'text-gray-300 hover:bg-gray-800/80' 
                                : 'text-gray-900 hover:bg-gray-50'
                              } transition-all duration-200`}
                          >
                            <span className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-100'} ring-1 ring-black/5 shadow-sm transition-colors duration-200`}>
                              <HomeIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </span>
                            Ana Sayfa
                          </Link>

                          <Link
                            href="/store"
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
                              ${theme === 'dark' 
                                ? 'text-gray-300 hover:bg-gray-800/80' 
                                : 'text-gray-900 hover:bg-gray-50'
                              } transition-all duration-200`}
                          >
                            <span className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-100'} ring-1 ring-black/5 shadow-sm transition-colors duration-200`}>
                              <ShoppingBagIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </span>
                            Mağaza
                          </Link>

                          {session && (
                            <div className="space-y-1">
                              {products.map((item) => (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
                                    ${theme === 'dark' 
                                      ? 'text-gray-300 hover:bg-gray-800/80' 
                                      : 'text-gray-900 hover:bg-gray-50'
                                    } transition-all duration-200 ${
                                      item.highlight
                                        ? item.highlightColor === 'blue'
                                          ? theme === 'dark' 
                                            ? 'bg-blue-900/10 hover:bg-blue-900/20'
                                            : 'bg-blue-50 hover:bg-blue-100/80'
                                          : theme === 'dark'
                                            ? 'bg-green-900/10 hover:bg-green-900/20'
                                            : 'bg-green-50 hover:bg-green-100/80'
                                        : ''
                                    }`}
                                >
                                  <span className={`p-1.5 rounded-lg ${
                                    item.highlight
                                      ? item.highlightColor === 'blue'
                                        ? theme === 'dark'
                                          ? 'bg-blue-900/30 group-hover:bg-blue-900/40'
                                          : 'bg-blue-100 group-hover:bg-blue-200'
                                        : theme === 'dark'
                                          ? 'bg-green-900/30 group-hover:bg-green-900/40'
                                          : 'bg-green-100 group-hover:bg-green-200'
                                      : theme === 'dark'
                                        ? 'bg-gray-800 group-hover:bg-gray-700'
                                        : 'bg-white group-hover:bg-gray-100'
                                  } ring-1 ring-black/5 shadow-sm transition-colors duration-200`}>
                                    <item.icon className={`h-4 w-4 ${
                                      item.highlight
                                        ? item.highlightColor === 'blue'
                                          ? 'text-blue-400'
                                          : 'text-green-400'
                                        : theme === 'dark'
                                          ? 'text-blue-400'
                                          : 'text-blue-600'
                                    }`} />
                                  </span>
                                  {item.name}
                                  {item.highlight && (
                                    <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                                      item.highlightColor === 'blue'
                                        ? theme === 'dark'
                                          ? 'bg-blue-900/30 text-blue-300'
                                          : 'bg-blue-100 text-blue-700'
                                        : theme === 'dark'
                                          ? 'bg-green-900/30 text-green-300'
                                          : 'bg-green-100 text-green-700'
                                    }`}>
                                      Önerilen
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}

                          <Link
                            href="/about"
                            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
                              ${theme === 'dark' 
                                ? 'text-gray-300 hover:bg-gray-800/80' 
                                : 'text-gray-900 hover:bg-gray-50'
                              } transition-all duration-200`}
                          >
                            <span className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-100'} ring-1 ring-black/5 shadow-sm transition-colors duration-200`}>
                              <InformationCircleIcon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                            </span>
                            Hakkında
                          </Link>
                        </div>
                      </div>

                      {session && (
                        <div className="space-y-2 pt-2">
                          <div className="px-3 flex items-center justify-between">
                            <p className={`text-xs font-semibold uppercase tracking-wider ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Hesap
                            </p>
                            <div className={`h-px flex-grow mx-3 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`} />
                          </div>
                          <div className="space-y-1 px-2">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium 
                                  ${theme === 'dark' 
                                    ? 'text-gray-300 hover:bg-gray-800/80' 
                                    : 'text-gray-900 hover:bg-gray-50'
                                  } transition-all duration-200`}
                              >
                                <span className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-gray-800 group-hover:bg-gray-700' : 'bg-white group-hover:bg-gray-100'} ring-1 ring-black/5 shadow-sm transition-colors duration-200`}>
                                  <item.icon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                                </span>
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </nav>
                  </div>
                </div>
                <div className={`px-5 py-6 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gradient-to-b from-gray-50 to-gray-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={toggleTheme}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        theme === 'dark' 
                          ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 ring-1 ring-yellow-400/20' 
                          : 'bg-white text-gray-600 hover:bg-gray-50 ring-1 ring-black/5'
                      } shadow-sm`}
                    >
                      {theme === 'dark' ? (
                        <SunIcon className="h-5 w-5" />
                      ) : (
                        <MoonIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    {session ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-x-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-red-600 hover:to-red-700 transition-all duration-200"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Çıkış Yap
                      </button>
                    ) : (
                      <>
                        <Link
                          href="/auth/login"
                          className="w-full flex items-center justify-center gap-x-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                        >
                          <UserIcon className="h-5 w-5" />
                          Giriş Yap
                        </Link>
                        <Link
                          href="/auth/register"
                          className="w-full flex items-center justify-center gap-x-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-green-600 hover:to-green-700 transition-all duration-200"
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