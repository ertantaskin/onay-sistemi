import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CheckCircleIcon, ArrowRightIcon, CreditCardIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }
  
  // Kullanıcı bilgilerini ve kredi bakiyesini getir
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });
  
  // Toplam onay sayısını getir
  const totalApprovals = await prisma.approval.count({
    where: { userId: session.user.id }
  });

  // Son işlemi getir
  const lastTransaction = await prisma.creditTransaction.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeText = (type: string) => {
    const types: { [key: string]: string } = {
      deposit: 'Yükleme',
      usage: 'Kullanım',
      coupon: 'Kupon',
      refund: 'İade'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Onay Al */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Onay Al</h2>
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                IID numaranızı girerek hemen onay numaranızı alabilirsiniz.
              </p>
              <Link
                href="/dashboard/approvals/new"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                Onay Al
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Kredi Yükle */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kredi Yükle</h2>
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <CreditCardIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Kredi kartı veya kupon kodu ile hesabınıza kredi yükleyebilirsiniz.
              </p>
              <Link
                href="/dashboard/credits/add"
                className="inline-flex items-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
              >
                Kredi Yükle
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Onay Geçmişi */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Onay Geçmişi</h2>
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <ClockIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Geçmiş onay işlemlerinizi görüntüleyebilirsiniz.
              </p>
              <Link
                href="/dashboard/approvals/history"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
              >
                Geçmişi Görüntüle
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Kredi Bilgisi */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kredi Bilgisi</h2>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300">Mevcut Krediniz</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{user?.credits || 0} Kredi</p>
              </div>
              <Link
                href="/dashboard/credits/history"
                className="inline-flex items-center text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
              >
                Kredi Geçmişi
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 