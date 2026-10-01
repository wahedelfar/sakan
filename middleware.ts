import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/admin/settings' || pathname.startsWith('/admin/settings/')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (pathname === '/super-admin' || pathname.startsWith('/super-admin/')) {
    if (pathname === '/super-admin/login') return NextResponse.next();
    if (!request.cookies.get('sakan_super')?.value) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/settings/:path*', '/super-admin/:path*'],
};
