import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log('Bağlantı denemesi başlıyor...');
    
    // MongoDB URI'yi kontrol et (hassas bilgileri maskeleyerek)
    const uri = process.env.MONGODB_URI || '';
    const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
    console.log('MongoDB URI:', maskedUri);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await dbConnect();
    console.log('Veritabanı bağlantısı kuruldu');
    
    // Veritabanı bağlantısını test et
    const isConnected = mongoose.connection.readyState === 1;
    console.log('Bağlantı durumu:', isConnected ? 'bağlı' : 'bağlı değil');

    if (!isConnected) {
      throw new Error('Database connection failed');
    }

    if (!mongoose.connection.db) {
      throw new Error('Database instance not available');
    }
    
    // Admin kullanıcısı oluştur (eğer yoksa)
    const adminExists = await User.findOne({ email: 'admin@onay-sistemi.com' });
    console.log('Admin kullanıcısı var mı:', !!adminExists);
    
    if (!adminExists) {
      // Şifreyi hashle
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await User.create({
        email: 'admin@onay-sistemi.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
        credit: 1000,
        isActive: true,
      });
      console.log('Admin kullanıcısı oluşturuldu');
    }

    // Koleksiyonları listele
    const collections = await mongoose.connection.db.collections();
    const collectionNames = collections.map(c => c.collectionName);

    return NextResponse.json({
      status: 'success',
      message: 'Veritabanı bağlantısı başarılı',
      dbStatus: isConnected ? 'connected' : 'disconnected',
      collections: collectionNames,
      mongoVersion: mongoose.version,
      nodeVersion: process.version
    });
  } catch (err) {
    console.error('Veritabanı bağlantı hatası:', err);
    const error = err as Error;
    return NextResponse.json(
      {
        status: 'error',
        message: 'Veritabanı bağlantısı başarısız',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        mongoVersion: mongoose.version,
        nodeVersion: process.version
      },
      { status: 500 }
    );
  }
} 