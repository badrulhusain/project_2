import { cn } from '@/src/lib/utils';
export function SeatMeter({ taken, capacity, label = true }: { taken: number; capacity: number; label?: boolean }) {
  const ratio = capacity ? Math.min(1, taken / capacity) : 0;
  const color = ratio >= .9 ? 'bg-negative' : ratio >= .7 ? 'bg-[#F4E55A]' : 'bg-[#5BC98F]';
  return <div><div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted">{label && <span>{ratio >= 1 ? 'Waitlist open' : `${Math.max(0,capacity-taken)} seats left`}</span>}<span className="ml-auto font-mono">{taken} / {capacity}</span></div><div className="h-3.5 overflow-hidden rounded-full border-2 border-[#141414] bg-white"><div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${ratio*100}%` }}/></div></div>;
}
