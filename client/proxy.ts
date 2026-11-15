import { NextResponse, type NextRequest } from 'next/server';
export function proxy(request: NextRequest) {
  const token = request.cookies.get('eventsense_token')?.value;
  const role = request.cookies.get('eventsense_role')?.value;
  if (!token) {
    const url = new URL('/login', request.url); url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN' && role !== 'ORGANIZER') return NextResponse.redirect(new URL('/me', request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/me/:path*', '/admin/:path*'] };
