import type { Metadata } from 'next';
import { MeDashboard } from '@/src/components/me-dashboard';
export const metadata: Metadata = { title: 'My tickets' };
export default function Page() { return <MeDashboard />; }
