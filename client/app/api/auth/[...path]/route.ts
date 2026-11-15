import type { NextRequest } from 'next/server';
import { getNeonAuth, neonAuthConfigured } from '@/src/lib/auth/server';

// Neon Auth proxy (Google sign-in). Our own /api/auth/login, /logout, /me and /register routes take priority over this catch-all.
type Ctx = { params: Promise<{ path: string[] }> };
function forward(method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH') {
  return (request: NextRequest, context: Ctx) => {
    if (!neonAuthConfigured()) return Response.json({ statusCode: 503, message: 'Google sign-in is not set up yet. Add NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET.' }, { status: 503 });
    const handler = getNeonAuth().handler();
    return handler[method](request, context);
  };
}
export const GET = forward('GET');
export const POST = forward('POST');
export const PUT = forward('PUT');
export const DELETE = forward('DELETE');
export const PATCH = forward('PATCH');
