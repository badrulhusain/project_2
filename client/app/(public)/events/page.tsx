import type { Metadata } from 'next';
import { EventsCatalog } from '@/src/components/events-catalog';
import { serverApi } from '@/src/lib/api';
import type { Event } from '@/src/lib/types';
export const metadata: Metadata = { title: 'Explore events', description: 'Find your next campus moment, then reserve your seat, meal and parking in one place.' };
export default async function EventsPage() { let events: Event[] = []; try { events = await serverApi<Event[]>('/api/events?limit=100'); } catch { /* client retry */ } return <div className="container-page py-12 md:py-16"><div className="mb-10"><span className="eyebrow">THE CAMPUS CALENDAR</span><h1 className="font-display mt-3 text-[clamp(42px,5vw,64px)] font-bold leading-none tracking-[-.055em]">Find your <span className="text-forest">next thing.</span></h1><p className="mt-5 max-w-xl text-base leading-7 text-muted">Workshops, festivals, conversations and everything in between. The good stuff is happening nearby.</p></div><EventsCatalog initialEvents={events}/></div>; }
