import type { Metadata } from 'next';
import { EventWizard } from '@/src/components/event-wizard';
export const metadata:Metadata={title:'New event | EventSense Studio'};
export default function Page(){return <EventWizard/>;}
