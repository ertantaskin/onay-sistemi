import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış.');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Mevcut bağlantı kullanılıyor...');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    console.log('MongoDB bağlantısı başlatılıyor...');
    console.log('MongoDB URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB bağlantısı başarılı!');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB bağlantı hatası:', error);
      throw error;
    });
  } else {
    console.log('Mevcut bağlantı promise kullanılıyor...');
  }

  try {
    cached.conn = await cached.promise;
    console.log('Bağlantı durumu:', mongoose.connection.readyState);
    return cached.conn;
  } catch (e) {
    console.error('Bağlantı hatası:', e);
    cached.promise = null;
    throw e;
  }
}

export default dbConnect; 