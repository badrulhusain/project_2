import { cookies } from 'next/headers';
import { serverApi } from '@/src/lib/api';
import type { User } from '@/src/lib/types';
export async function GET() {
  const token = (await cookies()).get('eventsense_token')?.value;
  if (!token) return Response.json({ statusCode: 401, message: 'Please sign in.' }, { status: 401 });
  try { return Response.json(await serverApi<User>('/api/auth/me', token)); }
  catch { return Response.json({ statusCode: 401, message: 'Session expired.' }, { status: 401 }); }
}
