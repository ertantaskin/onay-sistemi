import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MongoDB URI tanımlanmamış. Lütfen .env dosyasını kontrol edin.');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    console.log('Mevcut MongoDB bağlantısı kullanılıyor');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 5,
      minPoolSize: 1,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      family: 4
    };

    console.log('Yeni MongoDB bağlantısı oluşturuluyor...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB bağlantısı başarılı');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB bağlantı hatası:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect; 