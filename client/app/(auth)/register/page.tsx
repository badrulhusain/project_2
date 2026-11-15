import type { Metadata } from 'next';
import { AuthForm } from '@/src/components/auth-form';
export const metadata: Metadata = { title: 'Create account' };
export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string; type?: string; error?: string }> }) { const { next, type, error } = await searchParams; return <AuthForm mode="register" next={next} initialError={error} initialKind={type === 'organization' ? 'organization' : 'attendee'}/>; }
