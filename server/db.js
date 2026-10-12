// Database selector.
// - DATABASE_URL set  -> real PostgreSQL through Prisma (Docker / production-like).
// - DATABASE_URL unset -> built-in in-memory store (quick demo, data resets on restart).
let prisma;
if (process.env.DATABASE_URL) {
  const { PrismaClient } = await import('@prisma/client');
  prisma = new PrismaClient();
  console.log('Database: PostgreSQL (Prisma)');
} else {
  ({ prisma } = await import('./memory-store.js'));
  console.log('Database: in-memory demo store (set DATABASE_URL to use PostgreSQL)');
}
export { prisma };
