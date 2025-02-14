import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    name: string | null;
    email: string;
    credits: number;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      credits: number;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    credit: number;
  }
} 