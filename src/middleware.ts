import { NextResponse, type NextRequest } from 'next/server';
import { verifyTokenEdge } from '@/lib/auth-edge';

const CLIENT_ROUTES = ['/dashboard', '/orders', '/profile', '/addresses', '/favorites', '/notifications'];
const VENDOR_ROUTES = ['/vendor'];
const ADMIN_ROUTES = ['/admin'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

function homeFor(role?: string) {
  switch (role) {
    case 'admin': return '/admin/dashboard';
    case 'vendor': return '/vendor/dashboard';
    default: return '/dashboard';
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('kpalime_token')?.value;
  const payload = token ? await verifyTokenEdge(token) : null;
  const login = () => NextResponse.redirect(new URL(`/auth/login?redirect=${encodeURIComponent(pathname)}`, request.url));

  if (payload && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL(homeFor(payload.role), request.url));
  }
  if (CLIENT_ROUTES.some((r) => pathname.startsWith(r)) && !payload) return login();

  if (VENDOR_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) return login();
    if (payload.role !== 'vendor' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!payload) return login();
    if (payload.role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', '/orders/:path*', '/profile/:path*', '/addresses/:path*',
    '/favorites/:path*', '/notifications/:path*', '/vendor/:path*', '/admin/:path*',
    '/auth/login', '/auth/register',
  ],
};
