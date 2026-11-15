import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL_UNPOOLED } } });
try {
  const tables = await db.$queryRaw`
    SELECT n.nspname AS schemaname, c.relname AS tablename, c.reltuples::bigint AS estimated_rows
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'r' AND n.nspname = 'public'
    ORDER BY c.relname`;
  const summary = [];
  for (const table of tables) {
    const name = `"${table.tablename.replaceAll('"', '""')}"`;
    const count = await db.$queryRawUnsafe(`SELECT count(*)::int AS count FROM public.${name}`);
    summary.push({ schema: table.schemaname, table: table.tablename, rows: count[0].count });
  }
  console.log(JSON.stringify(summary, null, 2));
} finally { await db.$disconnect(); }
