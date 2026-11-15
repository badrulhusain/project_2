import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminEventDetail } from '@/src/components/admin-event-detail';
export const metadata:Metadata={title:'Event workspace | EventSense Studio'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <Suspense fallback={<div className="skeleton h-[600px]"/>}><AdminEventDetail id={(await params).id}/></Suspense>;}
