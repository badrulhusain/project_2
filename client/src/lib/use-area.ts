import { usePathname } from 'next/navigation';
/** Inside the organizer workspace, ticket pages stay in that workspace. */
export function useTicketBase() { return usePathname().startsWith('/admin') ? '/admin/tickets' : '/me/bookings'; }
export function useTicketsHome() { return usePathname().startsWith('/admin') ? '/admin/tickets' : '/me/tickets'; }
