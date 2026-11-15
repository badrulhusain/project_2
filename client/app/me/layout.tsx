import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserShell } from '@/src/components/user-shell';
import { serverApi } from '@/src/lib/api';
import type { User } from '@/src/lib/types';
export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('eventsense_token')?.value;
  if (!token) redirect('/login?next=/me');
  let user: User;
  try { user = await serverApi<User>('/api/auth/me', token); } catch { redirect('/login?next=/me'); }
  return <UserShell user={user}>{children}</UserShell>;
}
