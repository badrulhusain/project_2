import Link from 'next/link';
import { Star } from 'lucide-react';
export function Wordmark({ compact = false, href = '/' }: { compact?: boolean; href?: string }) {
  return <Link href={href} aria-label="EventSense home" className="font-display flex items-center gap-2 text-[24px] font-extrabold uppercase leading-none tracking-[-.04em]"><Star size={18} className="shrink-0 fill-[#F4E55A] text-[#141414]" />{!compact && <>EVENT<span className="rounded-md bg-[#141414] px-1.5 py-0.5 text-[#F4E55A]">SENSE</span></>}</Link>;
}
