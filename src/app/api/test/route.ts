import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await dbConnect();
    
    // Veritabanı bağlantısını test et
    const isConnected = mongoose.connection.readyState === 1;
    
    // Admin kullanıcısı oluştur (eğer yoksa)
    const adminExists = await User.findOne({ email: 'admin@onay-sistemi.com' });
    
    if (!adminExists) {
      await User.create({
        email: 'admin@onay-sistemi.com',
        password: 'Admin123!',
        name: 'Admin',
        role: 'admin',
        credit: 1000,
        isActive: true,
      });
    }

    return NextResponse.json({
      status: 'success',
      message: 'Veritabanı bağlantısı başarılı',
      dbStatus: isConnected ? 'connected' : 'disconnected',
    });
  } catch (error) {
    console.error('Veritabanı bağlantı hatası:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Veritabanı bağlantısı başarısız',
        error: error.message,
      },
      { status: 500 }
    );
  }
} 