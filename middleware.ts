import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const publicPaths = new Set([
  '/',
  '/accept-invitation',
  '/auth',
  '/manifest.webmanifest',
  '/sw.js',
  '/favicon.ico',
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.has(pathname) || pathname.startsWith('/icons/') || pathname.startsWith('/_next') || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('session_token')?.value;
  if (!token) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
