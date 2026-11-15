import { NextResponse } from 'next/server';
export async function POST() { const response = NextResponse.json({ ok: true }); response.cookies.delete('eventsense_token'); response.cookies.delete('eventsense_role'); return response; }
