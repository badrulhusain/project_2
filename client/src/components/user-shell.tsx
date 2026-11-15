'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarSearch, ChevronLeft, Plus, ChevronRight, LayoutDashboard, LogOut, Menu, Ticket, X } from 'lucide-react';
import { useState } from 'react';
import { Wordmark } from './ui/wordmark';
import { ThemeToggle } from './ui/theme-toggle';
import type { User } from '@/src/lib/types';

const baseLinks = [
  { href: '/me', label: 'Overview', icon: LayoutDashboard },
  { href: '/me/tickets', label: 'My tickets', icon: Ticket },
  { href: '/events', label: 'Explore events', icon: CalendarSearch },
];

export function UserShell({ children, user }: { children: React.ReactNode; user: User }) {
  const path = usePathname(); const router = useRouter(); const query = useQueryClient();
  const [collapsed, setCollapsed] = useState(false); const [mobileOpen, setMobileOpen] = useState(false);
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); query.setQueryData(['session'], null); router.push('/'); router.refresh(); }
  const isActive = (href: string) => href === '/me' ? path === '/me' : href === '/me/tickets' ? path.startsWith('/me/tickets') || path.startsWith('/me/bookings') : href === '/admin' ? false : path.startsWith(href);
  const links = baseLinks;
  const initial = user.name.trim().charAt(0).toUpperCase();
  return <div className="dash min-h-screen bg-background lg:flex">
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r-2 border-ink bg-surface transition-all duration-300 lg:sticky lg:top-0 lg:h-screen ${collapsed ? 'lg:w-[82px]' : 'lg:w-[250px]'} ${mobileOpen ? 'w-[250px] translate-x-0' : 'w-[250px] -translate-x-full lg:translate-x-0'}`}>
      <div className="flex h-[78px] items-center justify-between border-b-2 border-ink px-5"><Wordmark compact={collapsed && !mobileOpen} href="/me" /><button onClick={() => setMobileOpen(false)} className="flex size-9 items-center justify-center lg:hidden" aria-label="Close sidebar"><X size={20} /></button></div>
      <nav className="flex-1 space-y-2 p-4" aria-label="Attendee navigation">
        <p className={`mb-4 px-3 text-[10px] font-extrabold uppercase tracking-[.2em] text-muted ${collapsed ? 'lg:hidden' : ''}`}>My space</p>
        {links.map(item => <Link key={item.href} onClick={() => setMobileOpen(false)} href={item.href} title={item.label} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition ${isActive(item.href) ? 'border-2 border-[#141414] bg-[#F4E55A] text-[#141414] shadow-[3px_3px_0_#141414]' : 'border-2 border-transparent text-muted hover:bg-background hover:text-ink'}`}><item.icon size={19} strokeWidth={1.8} /><span className={collapsed ? 'lg:hidden' : ''}>{item.label}</span></Link>)}
      {user.role === 'USER' && <Link href="/onboarding/organizer" onClick={() => setMobileOpen(false)} title="Create an event" className={`mt-6 flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-[#141414] bg-[#141414] px-3 text-xs font-extrabold uppercase tracking-wide text-[#F4E55A] shadow-[3px_3px_0_#58695e] ${collapsed ? 'lg:px-0' : ''}`}><Plus size={17} /><span className={collapsed ? 'lg:hidden' : ''}>Create an event</span></Link>}
      </nav>
      <div className="border-t border-line p-4">
        <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-bold text-muted hover:bg-background"><ChevronLeft size={18} /><span className={collapsed ? 'lg:hidden' : ''}>View public site</span></Link>
        <button onClick={() => setCollapsed(!collapsed)} className="mt-2 hidden min-h-10 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-muted hover:bg-background lg:flex" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}<span className={collapsed ? 'lg:hidden' : ''}>Collapse sidebar</span></button>
      </div>
    </aside>
    {mobileOpen && <button className="fixed inset-0 z-40 bg-[#0E261D]/55 lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-30 flex h-[78px] items-center justify-between gap-4 border-b-2 border-ink bg-background/95 px-5 backdrop-blur-xl md:px-9">
        <div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="flex size-10 items-center justify-center rounded-xl border border-line lg:hidden" aria-label="Open menu"><Menu size={20} /></button><div><span className="eyebrow">YOUR SPACE</span><p className="text-sm font-bold">Tickets, plans and notes</p></div></div>
        <div className="flex items-center gap-3"><ThemeToggle /><div className="hidden items-center gap-3 sm:flex"><span className="flex size-9 items-center justify-center rounded-full bg-[#F4E55A] text-xs font-extrabold text-[#141414]">{initial}</span><div className="text-right"><p className="text-xs font-bold">{user.name}</p><p className="text-[11px] text-muted">{user.role === 'USER' ? 'Attendee' : 'Organizer'}</p></div></div><button title="Sign out" aria-label="Sign out" onClick={logout} className="flex size-11 items-center justify-center rounded-xl border border-line text-muted hover:text-negative"><LogOut size={17} /></button></div>
      </header>
      <main className="mx-auto max-w-[1500px] px-5 py-8 md:px-9 md:py-10">{children}</main>
    </div>
  </div>;
}
