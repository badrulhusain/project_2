import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { OrganizationNameForm } from '@/src/components/organization-name-form';
import { serverApi } from '@/src/lib/api';
import type { User } from '@/src/lib/types';

export const metadata: Metadata = { title: 'Start hosting events' };

export default async function Page() {
  const token = (await cookies()).get('eventsense_token')?.value;
  if (!token) redirect('/login?next=/onboarding/organizer');
  let user: User;
  try { user = await serverApi<User>('/api/auth/me', token); } catch { redirect('/login?next=/onboarding/organizer'); }
  if (user.role !== 'USER') redirect(user.organization ? '/admin/events/new' : '/onboarding/organization');
  return <OrganizationNameForm mode="upgrade" />;
}
