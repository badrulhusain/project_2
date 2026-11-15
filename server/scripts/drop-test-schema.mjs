import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const url = new URL(process.env.DATABASE_URL_UNPOOLED ?? '');
if (process.argv[2] !== '--drop-test-schema' ||
    process.env.NEON_BRANCH !== 'development' ||
    url.hostname !== 'ep-young-cherry-bepctmw7.c-9.us-east-2.aws.neon.tech' ||
    url.pathname !== '/neondb') throw new Error('Refusing to drop an unexpected schema or database');
const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
try { await db.$executeRawUnsafe('DROP SCHEMA IF EXISTS eventsense_test CASCADE'); console.log('Removed isolated test schema.'); }
finally { await db.$disconnect(); }
