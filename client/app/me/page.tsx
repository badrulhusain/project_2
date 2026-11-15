import type { Metadata } from 'next';
import { MeOverview } from '@/src/components/me-overview';
export const metadata: Metadata = { title: 'My dashboard' };
export default function MePage() { return <MeOverview />; }
