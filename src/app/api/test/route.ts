import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Veritabanı bağlantısını test et
    const testConnection = await prisma.$connect();
    
    // Veritabanı şemasını kontrol et
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    // Kullanıcı sayısını kontrol et
    const userCount = await prisma.user.count();

    // Onay sayısını kontrol et
    const approvalCount = await prisma.approval.count();

    // Kredi işlemi sayısını kontrol et
    const transactionCount = await prisma.creditTransaction.count();

    return NextResponse.json({
      status: 'success',
      message: 'Sistem çalışıyor',
      database: {
        connected: true,
        tables,
        counts: {
          users: userCount,
          approvals: approvalCount,
          transactions: transactionCount
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test hatası:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Sistem hatası',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 