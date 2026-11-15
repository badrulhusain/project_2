import type { Metadata } from 'next';
import { AdminDashboard } from '@/src/components/admin-dashboard';
export const metadata: Metadata = { title: 'Organizer overview' };
export default function AdminPage(){return <AdminDashboard/>;}
