import NextAuth, { AuthOptions, Session, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { JWT } from 'next-auth/jwt';
import { v4 as uuidv4 } from 'uuid';

interface CustomUser extends NextAuthUser {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  isAdmin: boolean;
  role: string;
}

interface CustomSession extends Omit<Session, 'user'> {
  user: CustomUser;
  sessionId: string;
}

interface CustomToken extends JWT {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  isAdmin: boolean;
  role: string;
  sessionId: string;
}

const MAX_ACTIVE_SESSIONS = 2;
const SESSION_IDLE_TIMEOUT = 30 * 60;

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email ve şifre gerekli');
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) {
            throw new Error('Kullanıcı bulunamadı');
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            throw new Error('Geçersiz şifre');
          }

          // Önce tüm süresi dolmuş oturumları temizle
          await prisma.activeSession.deleteMany({
            where: {
              userId: user.id,
              lastActivity: {
                lt: new Date(Date.now() - SESSION_IDLE_TIMEOUT * 1000)
              }
            }
          });

          // Aktif oturumları say
          const activeSessionCount = await prisma.activeSession.count({
            where: {
              userId: user.id,
              lastActivity: {
                gt: new Date(Date.now() - SESSION_IDLE_TIMEOUT * 1000)
              }
            }
          });

          // Eğer maksimum oturum sayısına ulaşıldıysa, en eski oturumu sil
          if (activeSessionCount >= MAX_ACTIVE_SESSIONS) {
            const oldestSession = await prisma.activeSession.findFirst({
              where: {
                userId: user.id,
                lastActivity: {
                  gt: new Date(Date.now() - SESSION_IDLE_TIMEOUT * 1000)
                }
              },
              orderBy: {
                lastActivity: 'asc'
              }
            });

            if (oldestSession) {
              await prisma.activeSession.delete({
                where: { id: oldestSession.id }
              });
              console.log(`En eski oturum silindi: ${oldestSession.id}`);
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            credits: user.credits,
            isAdmin: user.isAdmin,
            role: user.role
          } as CustomUser;
        } catch (error) {
          console.error('Yetkilendirme hatası:', error);
          throw error;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.credits = (user as CustomUser).credits;
        token.isAdmin = (user as CustomUser).isAdmin;
        token.role = (user as CustomUser).role;
        token.sessionId = uuidv4();

        // Yeni oturum oluştur
        await prisma.activeSession.create({
          data: {
            userId: user.id,
            sessionToken: token.sessionId,
            lastActivity: new Date()
          }
        });
      }
      return token;
    },
    async session({ session, token }) {
      try {
        if (session?.user) {
          session.user.id = token.id;
          session.user.email = token.email;
          session.user.name = token.name;
          session.user.credits = (token as CustomToken).credits;
          session.user.isAdmin = (token as CustomToken).isAdmin;
          session.user.role = (token as CustomToken).role;
          (session as CustomSession).sessionId = token.sessionId;

          // Oturumu güncelle
          await prisma.activeSession.update({
            where: { sessionToken: token.sessionId },
            data: { lastActivity: new Date() }
          });

          // Diğer oturumları kontrol et ve temizle
          const activeSessions = await prisma.activeSession.findMany({
            where: {
              userId: token.id,
              sessionToken: { not: token.sessionId },
              lastActivity: {
                gt: new Date(Date.now() - SESSION_IDLE_TIMEOUT * 1000)
              }
            },
            orderBy: { lastActivity: 'asc' }
          });

          // Maksimum oturum sayısını aşan oturumları sil
          if (activeSessions.length >= MAX_ACTIVE_SESSIONS) {
            for (const session of activeSessions) {
              await prisma.activeSession.delete({
                where: { id: session.id }
              });
              console.log(`Fazla oturum silindi: ${session.id}`);
            }
          }
        }
        return session;
      } catch (error) {
        console.error('Oturum hatası:', error);
        throw error;
      }
    }
  },
  events: {
    async signOut({ token }) {
      if (token) {
        try {
          await prisma.activeSession.deleteMany({
            where: { sessionToken: (token as CustomToken).sessionId }
          });
        } catch (error) {
          console.error('Oturum sonlandırma hatası:', error);
        }
      }
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST } 