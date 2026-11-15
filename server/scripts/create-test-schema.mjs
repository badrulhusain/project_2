import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const url = new URL(process.env.DATABASE_URL_UNPOOLED ?? '');
if (url.hostname !== 'ep-young-cherry-bepctmw7.c-9.us-east-2.aws.neon.tech' || url.pathname !== '/neondb') throw new Error('Unexpected Neon test database');
const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
try { await db.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS eventsense_test'); console.log('Test schema ready.'); }
finally { await db.$disconnect(); }
