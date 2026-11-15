import { InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

// Prisma model queries honor the URL's schema; raw SQL needs an explicit table schema.
export async function lockEvent(tx: Prisma.TransactionClient, eventId: string) {
  const schema = new URL(process.env.DATABASE_URL ?? '').searchParams.get('schema') ?? 'public';
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(schema)) throw new InternalServerErrorException('Invalid database schema');
  const table = Prisma.raw(`"${schema}"."Event"`);
  return tx.$queryRaw(Prisma.sql`SELECT id FROM ${table} WHERE id = ${eventId}::uuid FOR UPDATE`);
}
