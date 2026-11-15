import { NextResponse, type NextRequest } from 'next/server';
import { getNeonAuth, neonAuthConfigured } from '@/src/lib/auth/server';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Google sign-in landing: Neon Auth appends neon_auth_session_verifier; its middleware exchanges it for a session cookie.
  if (path === '/auth/google') {
    if (!neonAuthConfigured()) return NextResponse.next();
    return getNeonAuth().middleware({ loginUrl: '/login', publicRoutes: ['/auth/google'] })(request);
  }

  const token = request.cookies.get('eventsense_token')?.value;
  const role = request.cookies.get('eventsense_role')?.value;
  if (!token) {
    const url = new URL('/login', request.url); url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (path.startsWith('/admin') && role !== 'ADMIN' && role !== 'ORGANIZER') return NextResponse.redirect(new URL('/me', request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/me/:path*', '/admin/:path*', '/auth/google'] };
