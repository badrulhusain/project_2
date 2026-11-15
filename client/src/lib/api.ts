import type { paths } from './api-types';

export type ApiPath = keyof paths | `/api/${string}`;
export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public error = 'Request failed') { super(message); this.name = 'ApiError'; }
}
export async function parseResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message;
    throw new ApiError(data?.statusCode ?? response.status, Array.isArray(message) ? message.join(', ') : message ?? 'Something went wrong. Please try again.', data?.error);
  }
  return data as T;
}
export async function api<T>(path: ApiPath, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/backend${path}`, {
    ...init,
    headers: { ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers },
    credentials: 'same-origin',
  });
  return parseResponse<T>(response);
}
export async function serverApi<T>(path: ApiPath, token?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api';
  const origin = base.replace(/\/api\/?$/, '');
  const response = await fetch(`${origin}${path}`, { cache: 'no-store', headers: token ? { authorization: `Bearer ${token}` } : {} });
  return parseResponse<T>(response);
}
