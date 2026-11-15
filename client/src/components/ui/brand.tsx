import Link from 'next/link';
import { Sparkles } from 'lucide-react';
export function Brand({ compact = false }: { compact?: boolean }) { return <Link href="/" className="inline-flex items-center gap-2.5 font-display text-[23px] font-bold tracking-tight text-ink" aria-label="EventSense home"><span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white"><Sparkles size={19} strokeWidth={1.8}/></span>{!compact && <span>Event<span className="text-forest">Sense</span><i className="ml-0.5 text-saffron not-italic">.</i></span>}</Link>; }
