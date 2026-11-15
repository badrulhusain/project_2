import type { Metadata } from 'next';
import { OrganizationSignup } from '@/src/components/organization-signup';
export const metadata: Metadata = { title: 'Create an organization', description: 'Start your EventSense organizer workspace and plan your first campus event.' };
export default function Page() { return <OrganizationSignup/>; }
