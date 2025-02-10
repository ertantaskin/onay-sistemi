import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

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

  return <DashboardContent user={user} totalApprovals={totalApprovals} lastTransaction={lastTransaction} />;
} 