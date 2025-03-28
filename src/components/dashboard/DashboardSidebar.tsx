import { useTheme } from '@/app/ThemeContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  UserCircle,
  History,
  CreditCard,
  Bell,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  Wallet,
  Receipt,
  UserCog,
  Key,
  BellRing,
  MessageSquareText,
  Cog,
  LifeBuoy,
  LogOutIcon,
  ShoppingBag
} from "lucide-react";

interface MenuItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isDanger?: boolean;
}

export function DashboardSidebar() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: "Dashboard",
      isActive: pathname === "/dashboard"
    },
    {
      href: "/dashboard/profile",
      icon: <UserCircle className="h-5 w-5" />,
      label: "Profil Bilgileri",
      isActive: pathname === "/dashboard/profile"
    },
    {
      href: "/dashboard/orders",
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Sipariş Geçmişi",
      isActive: pathname === "/dashboard/orders"
    },
    {
      href: "/dashboard/credits/add",
      icon: <Wallet className="h-5 w-5" />,
      label: "Kredi İşlemleri",
      isActive: pathname === "/dashboard/credits/add"
    },
    {
      href: "/dashboard/notifications",
      icon: <BellRing className="h-5 w-5" />,
      label: "Bildirimler",
      isActive: pathname === "/dashboard/notifications"
    },
    {
      href: "/dashboard/support",
      icon: <MessageSquareText className="h-5 w-5" />,
      label: "Destek Talebi",
      isActive: pathname.startsWith("/dashboard/support")
    },
    {
      href: "/dashboard/settings",
      icon: <Cog className="h-5 w-5" />,
      label: "Ayarlar",
      isActive: pathname === "/dashboard/settings"
    },
    {
      href: "/dashboard/help",
      icon: <LifeBuoy className="h-5 w-5" />,
      label: "Yardım",
      isActive: pathname === "/dashboard/help"
    }
  ];

  return (
    <div className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg overflow-hidden sticky top-24`}>
      <div className="p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                item.isActive
                  ? theme === 'dark'
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-blue-50 text-blue-600'
                  : theme === 'dark'
                    ? 'hover:bg-gray-700/50 text-gray-300'
                    : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`mr-3 ${
                item.isActive
                  ? theme === 'dark'
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}>
                {item.icon}
              </div>
              <span className="font-medium flex-1">{item.label}</span>
              <ChevronRight className={`h-4 w-4 ${
                item.isActive
                  ? theme === 'dark'
                    ? 'text-blue-400'
                    : 'text-blue-600'
                  : theme === 'dark'
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`} />
            </Link>
          ))}

          <button
            onClick={() => signOut()}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              theme === 'dark'
                ? 'hover:bg-red-500/20 text-red-400'
                : 'hover:bg-red-50 text-red-600'
            }`}
          >
            <div className={`mr-3 ${
              theme === 'dark'
                ? 'text-red-400'
                : 'text-red-500'
            }`}>
              <LogOutIcon className="h-5 w-5" />
            </div>
            <span className="font-medium flex-1">Çıkış Yap</span>
            <ChevronRight className={`h-4 w-4 ${
              theme === 'dark'
                ? 'text-red-400'
                : 'text-red-500'
            }`} />
          </button>
        </nav>
      </div>
    </div>
  );
} 