import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';

/** Upgrade the signed-in attendee to an organizer and swap the session cookies for the new role. */
export async function POST(request: Request) {
  const token = (await cookies()).get('eventsense_token')?.value;
  if (!token) return NextResponse.json({ statusCode: 401, message: 'Please sign in first.' }, { status: 401 });
  try {
    const upstream = await fetch(`${base}/auth/become-organizer`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: await request.text(), cache: 'no-store' });
    const data = await upstream.json();
    const response = NextResponse.json(upstream.ok ? { user: data.user } : data, { status: upstream.status });
    if (upstream.ok) {
      const cookie = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 86400 };
      response.cookies.set('eventsense_token', data.accessToken, cookie);
      response.cookies.set('eventsense_role', data.user.role, cookie);
    }
    return response;
  } catch {
    return NextResponse.json({ statusCode: 503, message: 'The event service is unavailable.' }, { status: 503 });
  }
}
