'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, CalendarCheck2, CalendarDays, MapPin, Ticket, UtensilsCrossed, Users } from 'lucide-react';
import { api } from '@/src/lib/api';
import type { Booking, Notification } from '@/src/lib/types';
import { dateTime } from '@/src/lib/utils';
import { useSession } from '@/src/lib/use-session';
import { KpiCard } from './ui/kpi-card';
import { StatusChip } from './ui/status-chip';
import { EmptyState, ErrorState } from './ui/feedback';
import { LandingCountdown } from './landing-countdown';

export function MeOverview() {
  const { data: user } = useSession();
  const [now] = useState(() => Date.now());
  const query = useQuery({ queryKey: ['bookings'], queryFn: () => api<Booking[]>('/api/me/bookings') });
  const all = useMemo(() => query.data ?? [], [query.data]);
  const upcoming = useMemo(() => all.filter(b => b.event && new Date(b.event.endAt).getTime() >= now && !['CANCELLED', 'RELEASED'].includes(b.status)).sort((a, b) => +new Date(a.event!.startAt) - +new Date(b.event!.startAt)), [all, now]);
  const next = upcoming[0];
  const attended = all.filter(b => b.status === 'CHECKED_IN').length;
  const seatCount = upcoming.filter(b => b.status !== 'WAITLISTED').reduce((sum, b) => sum + b.seats, 0);
  const meals = upcoming.reduce((sum, b) => sum + (b.foodOrder?.items.reduce((s, i) => s + i.quantity, 0) ?? 0), 0);
  const ids = [...new Set(upcoming.map(b => b.eventId))].join(',');
  const notices = useQuery({ queryKey: ['my-notifications', ids], enabled: !!query.data, queryFn: async () => { const batches = await Promise.all(ids.split(',').filter(Boolean).map(id => api<Notification[]>(`/api/events/${id}/notifications`).catch(() => [] as Notification[]))); return batches.flat().sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt)); } });
  const first = (user?.name ?? '').split(' ')[0];

  return <div>
    <span className="eyebrow">OVERVIEW</span>
    <h1 className="font-display mt-2 text-5xl font-bold">{first ? `Hi, ${first}` : 'Welcome'}<span className="text-saffron">.</span></h1>
    <p className="mt-3 max-w-xl text-sm text-muted">Your tickets, meals and reminders for the events you are joining.</p>

    {query.isPending ? <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-40" />)}</div> : query.isError ? <div className="mt-9"><ErrorState retry={() => query.refetch()} /></div> : <>
      <div className="mb-9 mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Upcoming events" value={upcoming.length} icon={CalendarDays} hint="Booked or waitlisted" />
        <KpiCard label="Seats reserved" value={seatCount} icon={Users} hint="Across upcoming events" />
        <KpiCard label="Meals ordered" value={meals} icon={UtensilsCrossed} hint="For upcoming events" />
        <KpiCard label="Events attended" value={attended} icon={CalendarCheck2} hint="Checked in so far" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="card overflow-hidden">
          {next ? <>
            <div className="bg-[#183F33] p-7 text-white md:p-9">
              <span className="text-[11px] font-extrabold uppercase tracking-[.18em] text-[#F2B257]">Next up</span>
              <h2 className="font-display mt-3 text-3xl font-bold leading-tight md:text-4xl">{next.event!.title}</h2>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80"><span className="flex items-center gap-2"><CalendarDays size={15} />{dateTime(next.event!.startAt)}</span><span className="flex items-center gap-2"><MapPin size={15} />{next.event!.venue}</span></div>
              <div className="mt-7"><LandingCountdown until={next.event!.startAt} /></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-6"><div className="flex items-center gap-3"><StatusChip status={next.status} />{next.seats > 1 && <span className="text-xs font-bold text-muted">{next.seats} seats</span>}</div><Link href={`/me/bookings/${next.id}`} className="btn btn-primary">{next.status === 'WAITLISTED' ? `Waitlist #${next.waitlistPosition}` : 'Open my ticket'} <ArrowRight size={16} /></Link></div>
          </> : <div className="p-7"><EmptyState title="Nothing on your calendar yet" body="Find something worth showing up for and reserve your seat." href="/events" action="Explore events" /></div>}
        </section>

        <section className="card p-6">
          <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-xl font-bold">Recent updates</h2><Bell size={18} className="text-forest" /></div>
          {notices.isPending ? <div className="skeleton h-40" /> : notices.data?.length ? <div className="divide-y divide-line">{notices.data.slice(0, 4).map(n => <div key={n.id} className="py-3 first:pt-0"><p className="text-sm font-bold">{n.title}</p><p className="mt-1 text-xs leading-5 text-muted">{n.body}</p><p className="mt-1.5 font-mono text-[10px] text-muted">{dateTime(n.scheduledAt)}</p></div>)}</div> : <p className="rounded-xl bg-background p-4 text-sm text-muted">All caught up. Reminders from organizers will appear here.</p>}
        </section>
      </div>

      <section className="mt-9">
        <div className="mb-5 flex items-center justify-between"><h2 className="font-display text-2xl font-bold">Your upcoming events</h2><Link href="/me/tickets" className="inline-flex items-center gap-1 text-sm font-bold text-forest hover:underline">All tickets <ArrowRight size={15} /></Link></div>
        {upcoming.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{upcoming.slice(0, 6).map(b => <Link key={b.id} href={`/me/bookings/${b.id}`} className="card group p-5 transition hover:-translate-y-1"><div className="mb-5 flex items-start justify-between"><span className="flex size-11 items-center justify-center rounded-xl bg-[#E8F1E8] text-forest dark:bg-[#244234]"><Ticket size={20} /></span><StatusChip status={b.status} /></div><h3 className="font-display text-xl font-bold group-hover:text-forest">{b.event!.title}</h3><div className="mt-3 space-y-1.5 text-xs font-semibold text-muted"><p className="flex items-center gap-2"><CalendarDays size={14} />{dateTime(b.event!.startAt)}</p><p className="flex items-center gap-2"><MapPin size={14} />{b.event!.venue}</p></div><div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs font-bold text-forest"><span>{b.seats > 1 ? `${b.seats} seats · view ticket` : 'View ticket'}</span><ArrowRight size={15} /></div></Link>)}</div> : <p className="rounded-xl bg-background p-5 text-sm text-muted">No upcoming bookings yet.</p>}
      </section>
    </>}
  </div>;
}
