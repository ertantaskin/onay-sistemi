import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string | null;
    email: string;
    credits: number;
    role: string;
    isAdmin: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      credits: number;
      role: string;
      isAdmin: boolean;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string | null;
    credits: number;
    role: string;
    isAdmin: boolean;
  }
} 