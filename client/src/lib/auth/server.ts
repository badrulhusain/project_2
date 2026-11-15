import { createNeonAuth } from '@neon/auth/next/server';

export const neonAuthConfigured = () => Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_COOKIE_SECRET);

let instance: ReturnType<typeof createNeonAuth> | undefined;
/** Created on first use so the app still runs when Neon Auth is not configured yet. */
export function getNeonAuth() {
  instance ??= createNeonAuth({
    baseUrl: process.env.NEON_AUTH_BASE_URL!,
    cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
  });
  return instance;
}
