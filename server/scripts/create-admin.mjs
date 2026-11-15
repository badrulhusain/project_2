// Usage: node scripts/create-admin.mjs <email> <password> [name]
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const [email, password, name = 'Platform Admin'] = process.argv.slice(2);
if (!email || !password) { console.error('Usage: node scripts/create-admin.mjs <email> <password> [name]'); process.exit(1); }
const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.upsert({
  where: { email: email.toLowerCase() },
  update: { role: 'ADMIN', passwordHash, name },
  create: { email: email.toLowerCase(), name, passwordHash, role: 'ADMIN' },
});
console.log(`Admin ready: ${user.email} (${user.role})`);
await prisma.$disconnect();
