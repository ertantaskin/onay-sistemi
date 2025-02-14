'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  HiChevronDown, 
  HiOutlineCreditCard, 
  HiOutlineTicket, 
  HiOutlineSupport,
  HiOutlineHome,
  HiOutlineUsers,
  HiOutlineClipboardCheck,
  HiOutlineCog,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineMenu,
  HiOutlineX
} from 'react-icons/hi';

export default function AdminMenu() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde tema tercihini kontrol et
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    // Mobil menüyü sayfa değişiminde kapat
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: HiOutlineHome,
      items: [
        { href: '/admin', label: 'Genel Bakış' }
      ]
    },
    {
      title: 'Kredi İşlemleri',
      icon: HiOutlineCreditCard,
      items: [
        { href: '/admin/credits', label: 'Kredi İşlemleri' },
        { href: '/admin/credits/pricing', label: 'Fiyatlandırma' },
        { href: '/admin/payment-methods', label: 'Ödeme Yöntemleri' }
      ]
    },
    {
      title: 'Kullanıcılar',
      icon: HiOutlineUsers,
      items: [
        { href: '/admin/users', label: 'Kullanıcı Listesi' }
      ]
    },
    {
      title: 'Onaylar',
      icon: HiOutlineClipboardCheck,
      items: [
        { href: '/admin/approvals', label: 'Onay Listesi' }
      ]
    },
    {
      title: 'Kupon Yönetimi',
      icon: HiOutlineTicket,
      items: [
        { href: '/admin/coupons', label: 'Kuponlar' }
      ]
    },
    {
      title: 'Destek Talepleri',
      icon: HiOutlineSupport,
      items: [
        { href: '/admin/support/tickets', label: 'Tüm Talepler' },
        { href: '/admin/support/categories', label: 'Kategoriler' }
      ]
    },
    {
      title: 'Ayarlar',
      icon: HiOutlineCog,
      items: [
        { href: '/admin/settings', label: 'Sistem Ayarları' }
      ]
    }
  ];

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Mobil menü butonu
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {isMobileMenuOpen ? (
        <HiOutlineX className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      ) : (
        <HiOutlineMenu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );

  const menuContent = (
    <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sistem yönetimi</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDarkMode ? 'Gündüz moduna geç' : 'Gece moduna geç'}
            >
              {isDarkMode ? (
                <HiOutlineSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <HiOutlineMoon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Kullanıcı Profili */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <HiOutlineUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Admin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-4">
            {menuItems.map((section, index) => (
              <div key={section.title} className={index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50 transition-colors">
                      <section.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {section.title}
                    </span>
                  </div>
                  <HiChevronDown
                    className={`w-5 h-5 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
                      openSections[section.title] ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                {openSections[section.title] && (
                  <div className="bg-gray-50 dark:bg-gray-700/30 py-2">
                    {section.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center pl-14 pr-4 py-3 text-sm transition-colors ${
                          pathname === item.href
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 font-medium'
                            : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center w-full px-4 py-3 space-x-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Mobil menü arka planı (overlay)
  const MobileMenuOverlay = () => (
    <div
      className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${
        isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    />
  );

  return (
    <>
      <MobileMenuButton />
      <MobileMenuOverlay />
      {menuContent}
    </>
  );
}