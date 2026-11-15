import type { Metadata } from 'next';
import { TicketDetail } from '@/src/components/ticket-detail';
export const metadata: Metadata = { title: 'My event ticket' };
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <TicketDetail id={id} />; }
