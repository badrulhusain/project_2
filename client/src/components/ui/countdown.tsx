'use client';
import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';
export function CountdownBadge({ until, label }: { until: string; label: string }) { const [now, setNow] = useState(() => Date.now()); useEffect(() => { const id = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(id); }, []); const minutes = Math.max(0, Math.floor((new Date(until).getTime()-now)/60000)); const text = minutes <= 0 ? `${label} closed` : minutes < 60 ? `${label} closes in ${minutes}m` : minutes < 1440 ? `${label} closes in ${Math.floor(minutes/60)}h` : `${label} closes in ${Math.floor(minutes/1440)}d`; return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"><Clock3 size={14}/>{text}</span>; }
