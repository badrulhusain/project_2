import type { Metadata } from 'next';
import { AdminEventsList } from '@/src/components/admin-events-list';
export const metadata: Metadata = { title: 'Events | EventSense Studio' };
export default function Page(){return <AdminEventsList/>;}
