'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowRight, Building2, CalendarDays, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/src/lib/types';

const schema = z.object({
  organizationName: z.string().trim().min(2, 'Enter your organization name.'),
  name: z.string().trim().min(2, 'Enter your name.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Use at least 8 characters.'),
});
type Values = z.infer<typeof schema>;

export function OrganizationSignup() {
  const router = useRouter();
  const query = useQueryClient();
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { organizationName: '', name: '', email: '', password: '' } });
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = form;
  async function submit(values: Values) {
    try {
      const response = await fetch('/api/auth/register-organization', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values) });
      const data = await response.json();
      if (!response.ok) {
        const message = Array.isArray(data.message) ? data.message.join(', ') : data.message ?? 'Could not create your organization.';
        setError('root', { message });
        return;
      }
      query.setQueryData(['session'], data.user as User);
      toast.success(`${values.organizationName} is ready. Let’s plan your first event.`);
      router.push('/admin/events/new');
      router.refresh();
    } catch { setError('root', { message: 'Could not reach the event service. Please try again.' }); }
  }
  return <div className="container-page grid min-h-[calc(100vh-76px)] items-center gap-12 py-12 lg:grid-cols-[1fr_1fr]"><div><span className="eyebrow">FOR CAMPUS ORGANIZERS</span><h1 className="font-display mt-4 max-w-xl text-[clamp(42px,5vw,64px)] font-bold leading-[1.03] tracking-[-.055em]">Make room for <span className="text-forest">your next great event.</span></h1><p className="mt-6 max-w-lg text-base leading-8 text-muted">Create your organization workspace, then set up an event with seats, meals, parking and power planned together.</p><div className="mt-10 grid gap-4 sm:grid-cols-2"><div className="card-flat p-5"><CalendarDays className="text-forest" size={23}/><p className="mt-4 text-sm font-bold">Create events right away</p><p className="mt-2 text-xs leading-5 text-muted">Start a draft as soon as your account is ready.</p></div><div className="card-flat p-5"><ShieldCheck className="text-forest" size={23}/><p className="mt-4 text-sm font-bold">One organizer workspace</p><p className="mt-2 text-xs leading-5 text-muted">Your events stay connected to your organization.</p></div></div></div><div className="card mx-auto w-full max-w-lg p-6 md:p-9"><span className="flex size-12 items-center justify-center rounded-xl bg-[#E8F1E8] text-forest dark:bg-[#254332]"><Building2 size={22}/></span><h2 className="font-display mt-5 text-2xl font-bold">Create your organization</h2><p className="mt-2 text-sm text-muted">You&apos;ll be the first organizer. No access code needed.</p><form className="mt-7 space-y-5" onSubmit={handleSubmit(submit)} noValidate><div><label htmlFor="organizationName" className="field-label">Organization name</label><input id="organizationName" className="input" autoComplete="organization" placeholder="e.g. Campus Arts Society" {...register('organizationName')}/>{errors.organizationName&&<p className="mt-1 text-xs text-negative">{errors.organizationName.message}</p>}</div><div><label htmlFor="organizerName" className="field-label">Your name</label><input id="organizerName" className="input" autoComplete="name" placeholder="Your full name" {...register('name')}/>{errors.name&&<p className="mt-1 text-xs text-negative">{errors.name.message}</p>}</div><div><label htmlFor="organizerEmail" className="field-label">Work email</label><input id="organizerEmail" type="email" className="input" autoComplete="email" placeholder="you@campus.edu" {...register('email')}/>{errors.email&&<p className="mt-1 text-xs text-negative">{errors.email.message}</p>}</div><div><label htmlFor="organizerPassword" className="field-label">Password</label><input id="organizerPassword" type="password" className="input" autoComplete="new-password" placeholder="At least 8 characters" {...register('password')}/>{errors.password&&<p className="mt-1 text-xs text-negative">{errors.password.message}</p>}</div>{errors.root&&<p role="alert" className="rounded-xl bg-[#FFE8DF] px-4 py-3 text-sm text-[#A73B29] dark:bg-[#4A2924] dark:text-[#FFB8A8]">{errors.root.message}</p>}<button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">{isSubmitting?'Creating workspace…':'Create organization & start an event'} <ArrowRight size={17}/></button><p className="text-center text-sm text-muted">Already organizing? <Link href="/login?next=/admin" className="font-bold text-forest hover:underline">Sign in</Link></p><p className="text-center text-xs text-muted">Just attending? <Link href="/register" className="font-bold text-forest hover:underline">Create an attendee account</Link></p></form></div></div>;
}
