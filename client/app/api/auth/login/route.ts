import { NextResponse } from 'next/server';
const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';
export async function POST(request: Request) {
  const body = await request.text();
  try {
    const upstream = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body, cache: 'no-store' });
    const data = await upstream.json();
    const response = NextResponse.json(upstream.ok ? { user: data.user } : data, { status: upstream.status });
    if (upstream.ok) {
      response.cookies.set('eventsense_token', data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 86400 });
      response.cookies.set('eventsense_role', data.user.role, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 86400 });
    }
    return response;
  } catch { return NextResponse.json({ statusCode: 503, message: 'The event service is unavailable.' }, { status: 503 }); }
}
