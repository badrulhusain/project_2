import 'dotenv/config';
import { deflateSync } from 'node:zlib';

const base = `http://localhost:${process.env.PORT ?? 3000}/api`;
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}
const header = Buffer.alloc(13); header.writeUInt32BE(2, 0); header.writeUInt32BE(2, 4); header[8] = 8; header[9] = 6;
const pixels = Buffer.from([0, 255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 0, 255, 255, 255, 255, 255, 255]);
const png = Buffer.concat([pngSignature, chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);

async function json(response) { const data = await response.json(); if (!response.ok) throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`); return data; }
const login = await json(await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@eventsense.dev', password: 'Admin@123' }) }));
const headers = { authorization: `Bearer ${login.accessToken}` };
const events = await json(await fetch(`${base}/admin/events`, { headers }));
const event = events.find(item => item.title === 'Campus Innovation Fest');
if (!event) throw new Error('Seeded event missing');
const form = new FormData(); form.append('file', new Blob([png], { type: 'image/png' }), 'smoke.png');
let uploaded = false;
try {
  const result = await json(await fetch(`${base}/events/${event.id}/media`, { method: 'POST', headers, body: form }));
  uploaded = true;
  if (!result.imageUrl?.startsWith('https://res.cloudinary.com/')) throw new Error('Unexpected Cloudinary URL');
  const detail = await json(await fetch(`${base}/events/${event.id}`));
  if (detail.imageUrl !== result.imageUrl) throw new Error('Media URL was not persisted');
  console.log('Cloudinary upload and Event image persistence passed.');
} finally {
  if (uploaded) {
    await json(await fetch(`${base}/events/${event.id}/media`, { method: 'DELETE', headers }));
    const detail = await json(await fetch(`${base}/events/${event.id}`));
    if (detail.imageUrl !== null) throw new Error('Media URL was not removed');
    console.log('Cloudinary image removal passed.');
  }
}
