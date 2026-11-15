'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '@/src/lib/api';
import type { User } from '@/src/lib/types';
import { Brand } from './ui/brand';

export function OrganizationNameForm() {
  const router = useRouter(); const client = useQueryClient();
  const [name, setName] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = name.trim();
    if (value.length < 2) { setError('Enter your organization name.'); return; }
    setBusy(true); setError('');
    try {
      const user = await api<User>('/api/auth/organization', { method: 'POST', body: JSON.stringify({ organizationName: value }) });
      client.setQueryData(['session'], user);
      toast.success(`${value} is ready. Let’s plan your first event.`);
      router.push('/admin/events/new'); router.refresh();
    } catch (err) { setError(err instanceof ApiError ? err.message : 'Could not save your organization. Please try again.'); setBusy(false); }
  }
  return <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-10">
    <div className="card w-full max-w-md p-7 md:p-9">
      <Brand />
      <span className="mt-8 flex size-12 items-center justify-center rounded-xl bg-[#E8F1E8] text-forest dark:bg-[#254332]"><Building2 size={22} /></span>
      <h1 className="font-display mt-5 text-3xl font-bold tracking-tight">Name your organization</h1>
      <p className="mt-2 text-sm text-muted">One last step before you create your first event.</p>
      <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
        <div><label htmlFor="org" className="field-label">Organization name</label><input id="org" autoFocus className="input" autoComplete="organization" placeholder="e.g. Campus Arts Society" value={name} onChange={e => setName(e.target.value)} />{error && <p role="alert" className="mt-1 text-xs text-negative">{error}</p>}</div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full">{busy ? 'Saving…' : 'Continue'} <ArrowRight size={17} /></button>
      </form>
    </div>
  </main>;
}
