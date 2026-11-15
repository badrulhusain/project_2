import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const dateTime = (value: string, options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short', ...options }).format(new Date(value));
export const dateOnly = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
export const timeOnly = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
export const percent = (value: number) => `${Math.round(value * 100)}%`;
export const titleCase = (value: string) => value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, x => x.toUpperCase());
export const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
export const calendarHref = (event: { title: string; description: string; venue: string; startAt: string; endAt: string }) => {
  const stamp = (date: string) => new Date(date).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART:${stamp(event.startAt)}`, `DTEND:${stamp(event.endAt)}`, `SUMMARY:${event.title}`, `LOCATION:${event.venue}`, `DESCRIPTION:${event.description.replace(/\n/g, ' ')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
};
