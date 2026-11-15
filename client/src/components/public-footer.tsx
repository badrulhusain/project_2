'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Star } from 'lucide-react';

const cols = [
  { title: 'Explore', links: [['All events', '/events'], ['My tickets', '/me'], ['Sign in', '/login']] },
  { title: 'Organizers', links: [['Host an event', '/register?type=organization'], ['Organizer studio', '/admin']] },
  { title: 'Join', links: [['Create account', '/register'], ['Browse events', '/events']] },
];

export function PublicFooter() {
  const path = usePathname();
  return <footer className={`${path === '/' ? '' : 'mt-24'} overflow-hidden bg-[#141414] text-white`}>
    <div className="border-b border-white/15"><div className="marquee"><div className="marquee-track py-4" aria-hidden="true">{[0, 1].map(k => <div key={k} className="flex shrink-0 items-center">{['Plan less', 'Waste less', 'Show up', 'See you there'].map(t => <span key={t + k} className="flex items-center font-display text-2xl font-extrabold uppercase tracking-tight text-[#F4E55A]"><Star size={18} className="mx-8 fill-white text-white" />{t}</span>)}</div>)}</div></div></div>
    <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
      <div>
        <h2 className="font-display text-[clamp(34px,4vw,56px)] font-extrabold uppercase leading-[.95] tracking-[-.045em]">Let&apos;s <span className="text-[#F4E55A]">plan</span> it.</h2>
        <p className="mt-5 max-w-xs text-sm leading-7 text-white/65">More of the moments that matter. Less of everything left behind.</p>
        <Link href="/register?type=organization" className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-xl border-2 border-[#F4E55A] bg-[#F4E55A] py-0 pl-5 pr-1.5 text-xs font-extrabold uppercase tracking-wide text-[#141414] transition hover:-translate-y-0.5">Host an event <span className="flex size-9 items-center justify-center rounded-lg bg-[#141414] text-[#F4E55A]"><ArrowUpRight size={16} /></span></Link>
      </div>
      {cols.map(col => <div key={col.title}><h3 className="mb-5 text-xs font-extrabold uppercase tracking-[.18em] text-[#F4E55A]">{col.title}</h3><div className="flex flex-col gap-3 text-sm font-semibold text-white/75">{col.links.map(([label, href]) => <Link key={label} href={href} className="w-fit transition hover:translate-x-1 hover:text-white">{label}</Link>)}</div></div>)}
    </div>
    <div className="container-page flex flex-wrap items-center justify-between gap-3 border-t border-white/15 py-6 text-xs font-semibold text-white/55"><span>© {2026} EVENTSENSE</span><span className="rounded-full bg-[#F6B8D6] px-3 py-1 font-extrabold uppercase tracking-wider text-[#141414]">Plan less. Waste less. Show up.</span></div>
  </footer>;
}
