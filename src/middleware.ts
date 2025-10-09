import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/account', '/experts', '/field', '/ask', '/library', '/community'];

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('next-auth.session-token') ?? request.cookies.get('__Secure-next-auth.session-token');

  const { pathname } = request.nextUrl;

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/experts/:path*', '/field/:path*', '/ask/:path*', '/library/:path*', '/community/:path*']
};
