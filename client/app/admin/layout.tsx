import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/src/components/admin-shell';
import { serverApi } from '@/src/lib/api';
import type { User } from '@/src/lib/types';
export default async function AdminLayout({children}:{children:React.ReactNode}) { const token=(await cookies()).get('eventsense_token')?.value; if(!token) redirect('/login?next=/admin'); let user:User; try{user=await serverApi<User>('/api/auth/me',token);}catch{redirect('/login?next=/admin');}if(user.role!=='ADMIN') redirect('/me'); return <AdminShell user={user}>{children}</AdminShell>; }
