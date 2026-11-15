import { CardSkeleton } from '@/src/components/ui/feedback';
export default function Loading() { return <div className="container-page py-16"><div className="skeleton mb-8 h-14 w-72"/><div className="skeleton mb-9 h-20 w-full"/><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i => <CardSkeleton key={i}/>)}</div></div>; }
