'use client';
import { useQuery } from '@tanstack/react-query';
import type { User } from './types';
export function useSession() { return useQuery<User | null>({ queryKey: ['session'], queryFn: async () => { const response = await fetch('/api/auth/me', { cache: 'no-store' }); return response.ok ? response.json() : null; }, staleTime: 60000 }); }
