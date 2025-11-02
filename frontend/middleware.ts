import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const isPublicRoute = pathname === '/' || 
                        pathname.startsWith('/_next') || 
                        pathname.startsWith('/api');
  
  // Auth routes
  const isAuthRoute = pathname === '/login' || 
                      pathname === '/signup' ||
                      pathname === '/forgot-password' ||
                      pathname === '/reset-password';

  // Protected routes (student and admin)
  const isStudentRoute = (pathname.startsWith('/dashboard') && !pathname.startsWith('/admin')) || 
                         pathname.startsWith('/problems') ||
                         pathname.startsWith('/leaderboard') ||
                         pathname.startsWith('/profile') ||
                         pathname.startsWith('/settings');
  
  const isAdminRoute = pathname.startsWith('/admin') ||
                       pathname.startsWith('/users') ||
                       pathname.startsWith('/reports') ||
                       pathname.startsWith('/logs') ||
                       pathname.startsWith('/config') ||
                       pathname.startsWith('/analytics');

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to dashboard if accessing auth routes while authenticated
  // Note: We redirect to student dashboard by default; user role check happens in layout
  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect to login if accessing protected routes without token
  if ((isStudentRoute || isAdminRoute) && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/problems/:path*',
    '/leaderboard/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/users/:path*',
    '/reports/:path*',
    '/logs/:path*',
    '/config/:path*',
    '/analytics/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
