import { User } from '@prisma/client';

// Genişletilmiş User tipi
declare global {
  namespace PrismaJson {
    // JSON alanları için tip tanımları
    type BillingDetails = {
      fullName: string;
      country: string;
      city: string;
      phone: string;
    };
  }
}

// Prisma'nın User modelini genişletiyoruz
declare module '@prisma/client' {
  interface User {
    billingDetails: string | object | null;
  }
}

export {}; 