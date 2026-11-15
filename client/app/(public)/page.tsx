import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, ArrowRight, CalendarCheck2, CarFront, MapPin, Sparkles, Star, Ticket, UtensilsCrossed, Zap } from 'lucide-react';
import { EventCard } from '@/src/components/event-card';
import { LandingCountdown } from '@/src/components/landing-countdown';
import { serverApi } from '@/src/lib/api';
import { dateOnly, eventTypeLabel } from '@/src/lib/utils';
import type { Event } from '@/src/lib/types';

const ticker = ['Plan less', 'Waste less', 'Show up', 'Book your seat', 'Pre-order your meal', 'Park with ease', 'Scan. Enter. Enjoy.'];
const tileColors = ['bg-[#F6B8D6]', 'bg-[#A9C8F5]', 'bg-[#BFE8C9]', 'bg-[#D9C6F7]'];
const tilts = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3'];
const planning = [
  { icon: Ticket, title: 'Seats', body: 'Real capacity, safety limits and a fair waitlist that fills itself.', bg: 'bg-[#F6B8D6]' },
  { icon: UtensilsCrossed, title: 'Meals', body: 'Pre-order food so organizers cook what people will actually eat.', bg: 'bg-[#BFE8C9]' },
  { icon: CarFront, title: 'Parking', body: 'Pick a zone before you arrive. No circling, no stress.', bg: 'bg-[#A9C8F5]' },
  { icon: Zap, title: 'Power', body: 'Equipment load planned across the day, kilowatt by kilowatt.', bg: 'bg-[#FFD76A]' },
];
const steps = [
  { n: '01', title: 'Find your thing', body: 'Browse events worth leaving your room for. Every detail in one place.', bg: 'bg-[#D9C6F7]' },
  { n: '02', title: 'Make it yours', body: 'Reserve your seat, pick your meal and parking before the day arrives.', bg: 'bg-[#F6B8D6]' },
  { n: '03', title: 'Just show up', body: 'Your QR ticket keeps check-in simple. Spend your energy on the experience.', bg: 'bg-[#BFE8C9]' },
];

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();

function Burst({ className = '' }: { className?: string }) {
  return <svg viewBox="0 0 100 100" className={className} aria-hidden="true"><path d="M50 0 L61 34 L96 25 L72 50 L96 75 L61 66 L50 100 L39 66 L4 75 L28 50 L4 25 L39 34 Z" fill="currentColor" stroke="#141414" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

export default async function HomePage() {
  let events: Event[] = [];
  try { events = await serverApi<Event[]>('/api/events?limit=6'); } catch { /* graceful empty state */ }
  const upcoming = events.filter(e => isFuture(e.startAt)).sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
  const next = upcoming[0];
  const shown = events.slice(0, 3);
  const collage: (Event | null)[] = [shown[0] ?? null, shown[1] ?? null, shown[2] ?? null, null];
  return <>
    {/* Ticker */}
    {/* <div className="marquee container-page pt-5"><div className="overflow-hidden rounded-2xl bg-[#141414] py-3 text-white" aria-hidden="true"><div className="marquee-track">{[0, 1].map(k => <div key={k} className="flex shrink-0 items-center">{ticker.map(t => <span key={t + k} className="flex items-center text-xs font-bold uppercase tracking-wider"><Star size={12} className="mx-6 fill-[#F4E55A] text-[#F4E55A]" />{t}</span>)}</div>)}</div></div></div> */}

    {/* Hero */}
    <section className="relative  overflow-hidden bg-[#F4E55A] text-[#141414]">
      <div className="container-page relative pt-16 text-center md:pt-24">
        <Burst className="absolute -left-2 top-16 hidden size-32 rotate-12 text-[#9CC4F2] md:block" />
        <Burst className="absolute right-4 top-40 hidden size-20 -rotate-12 text-[#F6B8D6] lg:block" />
        <span className="sticker left-[18%] top-6 hidden rotate-[-8deg] bg-[#9CC4F2] md:block">Campus events</span>
        <span className="sticker right-[14%] top-24 hidden rotate-[6deg] bg-[#F6B8D6] md:block">Seats · Meals · Parking</span>
        <span className="sticker left-[8%] top-56 hidden rotate-[-5deg] bg-[#F6B8D6] lg:block"><MapPin size={12} className="mr-1 inline" />On campus</span>
        <h1 className="font-display mx-auto max-w-4xl text-[clamp(48px,9vw,128px)] font-extrabold uppercase leading-[.9] tracking-[-.05em]">Plan less.<br />Waste less.<br />Show up.</h1>
        <p className="mx-auto mt-7 max-w-xl text-base font-medium leading-7 text-[#3b3b2f]">Every seat, meal, parking space and kilowatt has a place. Find your next campus event and be part of it.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/events" className="neo-sm inline-flex min-h-12 items-center gap-3 rounded-xl bg-white px-6 text-sm font-extrabold uppercase tracking-wide transition hover:-translate-y-0.5">Book your seat <span className="flex size-8 items-center justify-center rounded-lg bg-[#9CC4F2]"><ArrowRight size={16} /></span></Link>
          <Link href="/register?type=organization" className="neo-sm inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#141414] px-6 text-sm font-extrabold uppercase tracking-wide text-white transition hover:-translate-y-0.5">Host an event</Link>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          {next ? <><Link href={`/events/${next.id}`} className="text-xs font-extrabold uppercase tracking-[.18em] underline-offset-4 hover:underline">Next up · {next.title}</Link><LandingCountdown until={next.startAt} /></> : <p className="neo-sm rounded-full bg-white px-5 py-2 text-xs font-extrabold uppercase tracking-[.18em]">New events are on their way</p>}
        </div>
      </div>
      {/* Tilted collage */}
      <div className="relative mt-6 flex items-end justify-center gap-3 overflow-hidden px-3 pb-10 pt-12 md:gap-5">
        {collage.map((event, i) => <Link key={event?.id ?? i} href={event ? `/events/${event.id}` : '/events'} aria-label={event ? `View ${event.title}` : 'Browse all events'} className={`neo relative block h-[190px] w-[46%] shrink-0 overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-2 hover:rotate-0 md:h-[300px] md:w-[24%] ${tilts[i]} ${tileColors[i]} ${i > 1 ? 'hidden sm:block' : ''}`}>
          {event?.imageUrl ? <Image fill sizes="(max-width:768px) 46vw, 24vw" className="object-cover" src={event.imageUrl} alt={event.title} /> : <><div className="absolute -right-8 -top-10 size-40 rounded-full border-[26px] border-white/50" /><div className="absolute bottom-0 left-6 h-28 w-28 rounded-t-full border-[20px] border-white/50" /><Sparkles className="absolute bottom-6 right-6 text-[#141414]" size={30} strokeWidth={1.5} /></>}
          {event && <span className="absolute bottom-3 left-3 rounded-full border-2 border-[#141414] bg-white px-3 py-1 text-[11px] font-extrabold uppercase text-[#141414]">{eventTypeLabel(event)}</span>}
        </Link>)}
      </div>
    </section>

    {/* Black statement */}
    <section className="relative overflow-hidden bg-[#141414] pb-24 pt-28 text-white">
      <span className="sticker left-[8%] top-10 -rotate-6 bg-[#F4E55A]">About us</span>
      <div className="container-page">
        <h2 className="font-display max-w-5xl text-[clamp(34px,5.6vw,80px)] font-extrabold uppercase leading-[.98] tracking-[-.045em]">We believe every event should be <span className="text-[#F4E55A]">more than just</span> a date on a calendar.</h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/70">EventSense turns guesses into plans, so organizers waste less and everyone gets a better day.</p>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{planning.map((p, i) => <div key={p.title} className={`rounded-3xl border-2 border-white/10 ${p.bg} p-6 text-[#141414] transition hover:-translate-y-1 ${i % 2 ? 'lg:translate-y-6' : ''}`}><span className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#141414] bg-white"><p.icon size={22} strokeWidth={1.8} /></span><h3 className="font-display mt-10 text-2xl font-extrabold uppercase">{p.title}</h3><p className="mt-2 text-sm font-medium leading-6 text-[#2b2b2b]">{p.body}</p></div>)}</div>
      </div>
    </section>

    {/* Events */}
    <section className="relative bg-background py-24 md:py-28">
      <span className="sticker right-[8%] top-10 rotate-6 bg-[#D9C6F7]">Our events</span>
      <div className="container-page">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display max-w-3xl text-[clamp(34px,5vw,68px)] font-extrabold uppercase leading-[.98] tracking-[-.045em]">Join us for events that <span className="rounded-xl bg-[#F4E55A] px-2 text-[#141414]">inspire</span> &amp; connect.</h2>
            {upcoming.length > 0 && <div className="mt-6 flex flex-wrap gap-2">{upcoming.slice(0, 3).map(e => <span key={e.id} className="rounded-full border-2 border-[#141414] bg-[#D9C6F7] px-4 py-1.5 text-xs font-extrabold text-[#141414] dark:border-white/30">{dateOnly(e.startAt)}</span>)}</div>}
          </div>
          <Link className="neo-sm inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#F4E55A] px-6 text-sm font-extrabold uppercase text-[#141414]" href="/events">View all events <ArrowRight size={16} /></Link>
        </div>
        {shown.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{shown.map(event => <EventCard key={event.id} event={event} />)}</div> : <div className="neo rounded-3xl bg-[#BFE8C9] px-7 py-14 text-center text-lg font-bold text-[#141414]">New events are on their way. Check back soon.</div>}
      </div>
    </section>

    {/* How it works */}
    <section className="bg-[#D9C6F7] py-24 text-[#141414]">
      <div className="container-page">
        <div className="mb-12 flex items-end justify-between gap-6"><h2 className="font-display max-w-2xl text-[clamp(32px,4.6vw,62px)] font-extrabold uppercase leading-[.98] tracking-[-.045em]">From &ldquo;that looks good&rdquo; to see you there.</h2><ArrowDown className="hidden shrink-0 md:block" size={56} strokeWidth={2.2} /></div>
        <div className="grid gap-6 md:grid-cols-3">{steps.map((s, i) => <div key={s.n} className={`neo rounded-3xl ${s.bg} p-7 ${i === 1 ? 'md:-translate-y-4' : ''}`}><span className="font-mono text-sm font-bold">{s.n}</span><h3 className="font-display mt-14 text-3xl font-extrabold uppercase leading-none">{s.title}</h3><p className="mt-3 text-sm font-medium leading-6">{s.body}</p></div>)}</div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-[#141414] py-24 text-white">
      <div className="container-page text-center">
        <CalendarCheck2 className="mx-auto text-[#F4E55A]" size={44} strokeWidth={1.6} />
        <h2 className="font-display mx-auto mt-6 max-w-4xl text-[clamp(38px,7vw,104px)] font-extrabold uppercase leading-[.92] tracking-[-.05em]">Let&apos;s plan <span className="text-[#F4E55A]">your</span> next one.</h2>
        <p className="mx-auto mt-6 max-w-lg text-white/70">One clear view of attendance, meals, parking and power. Less guessing for organizers, better days for everyone.</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link href="/register?type=organization" className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[#F4E55A] bg-[#F4E55A] px-7 text-sm font-extrabold uppercase text-[#141414] transition hover:-translate-y-0.5">Host an event <ArrowRight size={16} /></Link>
          <Link href="/events" className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-white/40 px-7 text-sm font-extrabold uppercase text-white transition hover:bg-white/10">Join an event</Link>
        </div>
      </div>
    </section>
  </>;
}
