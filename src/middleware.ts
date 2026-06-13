import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/jwt';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-12345';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define public paths
  const isPublicPath = 
    pathname === '/login' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/setup-admin') ||
    pathname.startsWith('/favicon.ico');

  const token = request.cookies.get('token')?.value;

  if (isPublicPath) {
    if (token) {
      const payload = await verifyJWT(token, JWT_SECRET);
      if (payload) {
        // If logged in and trying to access login page, redirect to dashboard
        if (pathname === '/login') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Protected paths
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload) {
    // Cookie is invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
