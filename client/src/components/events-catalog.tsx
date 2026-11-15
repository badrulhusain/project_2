'use client';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import type { Event, EventType } from '@/src/lib/types';
import { eventTypes } from '@/src/lib/types';
import { api } from '@/src/lib/api';
import { titleCase } from '@/src/lib/utils';
import { EventCard } from './event-card';
import { CardSkeleton, EmptyState, ErrorState } from './ui/feedback';
export function EventsCatalog({ initialEvents }: { initialEvents: Event[] }) {
  const [search, setSearch] = useState(''); const [type, setType] = useState<EventType | 'ALL'>('ALL'); const [price, setPrice] = useState<'ALL'|'FREE'|'PAID'>('ALL'); const [date, setDate] = useState('');
  const query = useQuery({ queryKey: ['events'], queryFn: () => api<Event[]>('/api/events?limit=100'), initialData: initialEvents });
  const events = useMemo(() => (query.data ?? []).filter(event => {
    const text = `${event.title} ${event.description} ${event.venue}`.toLowerCase();
    return text.includes(search.toLowerCase()) && (type === 'ALL' || event.type === type) && (price === 'ALL' || (price === 'PAID') === event.isPaid) && (!date || event.startAt.slice(0,10) >= date);
  }), [query.data, search, type, price, date]);
  return <><div className="card-flat mb-8 p-4 md:p-5"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><span className="sr-only">Search events</span><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18}/><input value={search} onChange={e => setSearch(e.target.value)} className="input pl-11" placeholder="Search events, venues, moments…"/></label><label className="relative md:w-44"><span className="sr-only">Filter by price</span><select className="input appearance-none" value={price} onChange={e => setPrice(e.target.value as typeof price)}><option value="ALL">All prices</option><option value="FREE">Free</option><option value="PAID">Paid</option></select><SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" size={16}/></label><label className="md:w-44"><span className="sr-only">From date</span><input className="input" type="date" value={date} onChange={e => setDate(e.target.value)}/></label></div><div className="mt-4 flex flex-wrap gap-2" aria-label="Event types"><button onClick={() => setType('ALL')} className={`min-h-10 rounded-full px-4 text-xs font-bold transition ${type === 'ALL' ? 'bg-forest text-white dark:text-[#10251D]' : 'bg-background text-muted hover:text-ink'}`}>All events</button>{eventTypes.map(item => <button key={item} onClick={() => setType(item)} className={`min-h-10 rounded-full px-4 text-xs font-bold transition ${type === item ? 'bg-forest text-white dark:text-[#10251D]' : 'bg-background text-muted hover:text-ink'}`}>{titleCase(item)}</button>)}</div></div><div className="mb-5 flex items-center justify-between text-xs font-semibold text-muted"><span>{events.length} {events.length === 1 ? 'event' : 'events'} to explore</span><span>Showing upcoming first</span></div>{query.isPending ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i}/>)}</div> : query.isError ? <ErrorState retry={() => query.refetch()}/> : events.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.map(event => <EventCard key={event.id} event={event}/>)}</div> : <EmptyState title="No events in this corner yet" body="Try another type or clear the filters. A good plan often starts with a fresh look." href="/events" action="Clear the view"/>}</>;
}
