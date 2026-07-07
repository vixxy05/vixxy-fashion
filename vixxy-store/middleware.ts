import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TOKEN_KEY = 'vixxy_access_token';
const REFRESH_TOKEN_KEY = 'vixxy_refresh_token';

// Define route groups
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/products', '/about'];
const CUSTOMER_ROUTES = ['/customer'];
const STAFF_ROUTES = ['/staff'];
const ADMIN_ROUTES = ['/admin'];
const SUPER_ADMIN_ROUTES = ['/super-admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies/localStorage (for Next.js middleware, we need to use cookies)
  const accessToken = request.cookies.get(TOKEN_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_KEY)?.value;

  // Helper function to redirect
  const redirectTo = (destination: string) => {
    const url = request.nextUrl.clone();
    url.pathname = destination;
    return NextResponse.redirect(url);
  };

  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  
  // If public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if authenticated
  if (!accessToken) {
    // Redirect to login with intended path
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // For simplicity, we'll use client-side role checks with protected components
  // For real apps, you'd validate the token here and get user info
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
