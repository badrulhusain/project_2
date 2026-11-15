import { cn, titleCase } from '@/src/lib/utils';
export function StatusChip({ status, className }: { status: string; className?: string }) {
  const tone = ['CONFIRMED','CHECKED_IN','PUBLISHED','LIVE','OK','BALANCED','SENT'].includes(status) ? 'bg-[#E0F3E9] text-[#176B49] dark:bg-[#214C39] dark:text-[#A5E1BC]' : ['WAITLISTED','TIGHT','WARNING','DRAFT','PENDING'].includes(status) ? 'bg-[#FFF0D4] text-[#935E0A] dark:bg-[#4A381D] dark:text-[#F7C878]' : ['OVER','OVERLOAD','SHORTAGE_RISK','CANCELLED','RELEASED'].includes(status) ? 'bg-[#FFE5DD] text-[#B33D2E] dark:bg-[#512B27] dark:text-[#FFAB9C]' : 'bg-background text-muted';
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[.08em]', tone, className)}>{titleCase(status)}</span>;
}
