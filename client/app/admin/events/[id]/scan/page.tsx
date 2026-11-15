import type { Metadata } from 'next';
import { ScanScreen } from '@/src/components/scan-screen';
export const metadata:Metadata={title:'Event scanner | EventSense Studio'};
export default async function Page({params}:{params:Promise<{id:string}>}){return <ScanScreen id={(await params).id}/>;}
