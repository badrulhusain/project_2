import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api').replace(/\/api\/?$/, '');
async function forward(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `${base}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;
  const token = (await cookies()).get('eventsense_token')?.value;
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  try {
    const response = await fetch(target, { method: request.method, headers, body, cache: 'no-store' });
    return new Response(response.body, { status: response.status, headers: { 'content-type': response.headers.get('content-type') ?? 'application/json' } });
  } catch { return Response.json({ statusCode: 503, message: 'The event service is unavailable.', error: 'Service Unavailable' }, { status: 503 }); }
}
export { forward as GET, forward as POST, forward as PUT, forward as PATCH, forward as DELETE };
