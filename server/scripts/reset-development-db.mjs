import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

if (process.argv[2] !== '--reset-public-schema') throw new Error('Explicit reset flag required');
const url = new URL(process.env.DATABASE_URL_UNPOOLED ?? '');
if (process.env.NEON_BRANCH !== 'development' ||
    url.hostname !== 'ep-young-cherry-bepctmw7.c-9.us-east-2.aws.neon.tech' ||
    url.pathname !== '/neondb') throw new Error('Refusing to reset a different database');

const db = new PrismaClient({ datasources: { db: { url: url.toString() } } });
try {
  await db.$transaction(async tx => {
    await tx.$executeRawUnsafe('DROP SCHEMA public CASCADE');
    await tx.$executeRawUnsafe('CREATE SCHEMA public');
  });
  console.log('Reset public schema on the specified Neon development database.');
} finally { await db.$disconnect(); }
