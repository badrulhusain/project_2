'use client';
import { useEffect, useState } from 'react';
const pad = (n: number) => String(n).padStart(2, '0');
export function LandingCountdown({ until }: { until: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { const tick = () => setNow(Date.now()); const first = setTimeout(tick, 0); const id = setInterval(tick, 1000); return () => { clearTimeout(first); clearInterval(id); }; }, []);
  const left = now === null ? 0 : Math.max(0, new Date(until).getTime() - now);
  const parts = [['Days', Math.floor(left / 86400000)], ['Hrs', Math.floor(left / 3600000) % 24], ['Mins', Math.floor(left / 60000) % 60], ['Secs', Math.floor(left / 1000) % 60]] as const;
  return <div className="flex gap-3" aria-label="Time until the next event">{parts.map(([label, value]) => <div key={label} className="neo-sm flex w-[74px] flex-col items-center rounded-2xl bg-white py-3 text-[#141414] sm:w-[88px]"><span className="font-display text-3xl font-extrabold tabular-nums leading-none sm:text-4xl">{now === null ? '--' : pad(value)}</span><span className="mt-1.5 text-[10px] font-bold uppercase tracking-widest text-[#6b6b6b]">{label}</span></div>)}</div>;
}
