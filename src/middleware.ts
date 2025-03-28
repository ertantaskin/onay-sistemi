import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  
  // Korumalı rotalar için kontrol
  if (request.nextUrl.pathname.startsWith('/dashboard') || 
      request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Admin sayfaları için yetki kontrolü
    if (request.nextUrl.pathname.startsWith('/admin') && !token.isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Mağaza sayfaları için erişim kontrolü - artık herhangi bir kısıtlama yok
  // Store ile ilgili kısıtlamayı tamamen kaldırdık, herkes erişebilir

  // Oturum açıkken giriş ve kayıt sayfalarına erişimi engelle
  if ((request.nextUrl.pathname.startsWith('/auth/login') || 
       request.nextUrl.pathname.startsWith('/auth/register')) && 
      token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
    '/store/:path*',
  ],
}; 