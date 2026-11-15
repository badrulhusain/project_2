import type { Metadata } from 'next';
import { EventsCatalog } from '@/src/components/events-catalog';
import { serverApi } from '@/src/lib/api';
import type { Event } from '@/src/lib/types';
export const metadata: Metadata = { title: 'Explore events', description: 'Find your next campus moment, then reserve your seat, meal and parking in one place.' };
export default async function EventsPage() {
  let events: Event[] = [];
  try { events = await serverApi<Event[]>('/api/events?limit=100'); } catch { /* client retry */ }
  return <>
    <section className="relative overflow-hidden bg-[#F4E55A] text-[#141414]">
      <span className="sticker right-[10%] top-8 hidden rotate-6 bg-[#F6B8D6] md:block">The campus calendar</span>
      <span className="sticker right-[22%] top-24 hidden -rotate-6 bg-[#9CC4F2] lg:block">Seats · Meals · Parking</span>
      <div className="container-page py-14 md:py-20">
        <h1 className="font-display max-w-4xl text-[clamp(44px,8vw,112px)] font-extrabold uppercase leading-[.92] tracking-[-.05em]">Find your <span className="rounded-2xl bg-[#141414] px-3 text-[#F4E55A]">next</span> thing.</h1>
        <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[#3b3b2f]">Workshops, festivals, conversations and everything in between. The good stuff is happening nearby.</p>
      </div>
    </section>
    <div className="container-page py-12 md:py-16"><EventsCatalog initialEvents={events}/></div>
  </>;
}
