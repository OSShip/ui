import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isProtectedRoute(pathname: string): boolean {
  if (pathname.startsWith('/dashboard')) return true;
  return /^\/sessions\/[^/]+\/room$/.test(pathname);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sessions/:sessionId/room'],
};
