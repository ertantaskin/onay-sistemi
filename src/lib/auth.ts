import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './db';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email ve şifre gereklidir');
        }

        await dbConnect();

        // Email ile kullanıcıyı bul
        const user = await User.findOne({ email: credentials.email }).select('+password');
        
        if (!user) {
          throw new Error('Kullanıcı bulunamadı');
        }

        // Şifre kontrolü
        const isValid = await user.comparePassword(credentials.password);
        
        if (!isValid) {
          throw new Error('Geçersiz şifre');
        }

        // Kullanıcı aktif değilse
        if (!user.isActive) {
          throw new Error('Hesabınız aktif değil');
        }

        // Son giriş tarihini güncelle
        user.lastLogin = new Date();
        await user.save();

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 