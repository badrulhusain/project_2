'use client';
import { Download } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Booking } from '@/src/lib/types';
import { dateOnly, timeOnly } from '@/src/lib/utils';
import { downloadTicketPng } from '@/src/lib/ticket-image';

export function DownloadTicketButton({ booking, qrDataUrl, holder, parking, className = 'btn btn-secondary' }: { booking: Booking; qrDataUrl?: string; holder?: string; parking?: string | null; className?: string }) {
  const [busy, setBusy] = useState(false);
  const event = booking.event;
  async function download() {
    if (!event || !qrDataUrl || busy) return;
    setBusy(true);
    try {
      await downloadTicketPng({
        title: event.title,
        dateText: dateOnly(event.startAt),
        timeText: `${timeOnly(event.startAt)} – ${timeOnly(event.endAt)}`,
        venue: event.venue,
        holder,
        seats: booking.seats ?? 1,
        status: booking.status,
        qrDataUrl,
        token: booking.qrToken,
        parking: parking ?? booking.parkingZone?.name ?? null,
      }, `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event'}-ticket.png`);
      toast.success('Ticket saved as an image.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not create the ticket image.'); }
    finally { setBusy(false); }
  }
  return <button type="button" onClick={download} disabled={!event || !qrDataUrl || busy} className={className}><Download size={17} /> {busy ? 'Creating image…' : qrDataUrl ? 'Download ticket (PNG)' : 'Preparing ticket…'}</button>;
}
