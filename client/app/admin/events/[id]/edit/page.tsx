import type { Metadata } from 'next';
import { EventWizard } from '@/src/components/event-wizard';
export const metadata:Metadata={title:'Edit event | EventSense Studio'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <EventWizard id={(await params).id}/>;}
