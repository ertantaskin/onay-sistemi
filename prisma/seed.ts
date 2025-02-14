import { PrismaClient } from '@prisma/client';
import pkg from 'bcryptjs';
const { hash } = pkg;

const prisma = new PrismaClient();

async function main() {
  // Admin kullanıcısı oluştur
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      isAdmin: true,
      role: 'admin',
    },
  });

  // Varsayılan ödeme yöntemini oluştur
  const defaultPaymentMethod = await prisma.paymentMethod.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      name: 'Kredi Kartı',
      description: 'Varsayılan ödeme yöntemi',
      isActive: true,
    },
  });

  // Örnek kredi paketleri oluştur
  const creditPackages = [
    {
      name: 'Başlangıç Paketi',
      credits: 100,
      price: 49.99,
      paymentMethodId: defaultPaymentMethod.id,
    },
    {
      name: 'Standart Paket',
      credits: 500,
      price: 199.99,
      paymentMethodId: defaultPaymentMethod.id,
    },
    {
      name: 'Premium Paket',
      credits: 1000,
      price: 349.99,
      paymentMethodId: defaultPaymentMethod.id,
    },
  ];

  for (const pkg of creditPackages) {
    await prisma.creditPackage.upsert({
      where: {
        id: `default-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: {
        id: `default-${pkg.name.toLowerCase().replace(/\s+/g, '-')}`,
        ...pkg,
      },
    });
  }

  console.log('Seed tamamlandı:', {
    admin,
    defaultPaymentMethod,
    creditPackages,
  });
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 