import { NextResponse, type NextRequest } from 'next/server';
import { getNeonAuth, neonAuthConfigured } from '@/src/lib/auth/server';

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';
const safeNext = (value: string | null) => (value && value.startsWith('/') && !value.startsWith('//') ? value : null);

/** Landing route after Google sign-in: trade the Neon Auth session for an EventSense session cookie. */
export async function GET(request: NextRequest) {
  const fail = (message: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  if (!neonAuthConfigured()) return fail('Google sign-in is not set up yet.');
  try {
    const neonAuth = getNeonAuth();
    const { data: session } = await neonAuth.getSession();
    if (!session?.user) return fail('Google sign-in was not completed.');
    const { data, error } = await (neonAuth as unknown as { token: () => Promise<{ data?: { token?: string } | null; error?: unknown }> }).token();
    if (error || !data?.token) return fail('Could not verify your Google account.');
    const upstream = await fetch(`${base}/auth/neon`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: data.token }), cache: 'no-store' });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result?.accessToken) return fail(result?.message ?? 'Google sign-in failed.');
    const destination = safeNext(request.nextUrl.searchParams.get('next')) ?? (result.user.role === 'USER' ? '/me' : '/admin');
    const response = NextResponse.redirect(new URL(destination, request.url));
    const cookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 86400 };
    response.cookies.set('eventsense_token', result.accessToken, cookie);
    response.cookies.set('eventsense_role', result.user.role, cookie);
    return response;
  } catch {
    return fail('The sign-in service is unavailable.');
  }
}
