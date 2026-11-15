import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Providers } from '@/src/components/providers';
import './globals.css';
const display = localFont({ src: '../public/fonts/bricolage.ttf', variable: '--font-display', weight: '100 900' });
const body = localFont({ src: '../public/fonts/dm-sans.ttf', variable: '--font-body', weight: '100 900' });
const mono = localFont({ src: '../public/fonts/jetbrains-mono.ttf', variable: '--font-mono', weight: '100 800' });
export const metadata: Metadata = { title: { default: 'EventSense — Plan less. Waste less. Show up.', template: '%s · EventSense' }, description: 'A calmer way to discover campus events and plan every seat, meal, parking space and kilowatt.', openGraph: { title: 'EventSense', description: 'Good events leave great memories, not waste.', type: 'website' } };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable} ${mono.variable}`}><body><Providers>{children}</Providers></body></html>; }
