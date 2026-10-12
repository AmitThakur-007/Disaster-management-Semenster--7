// Database selector.
// - DATABASE_URL set & reachable -> real PostgreSQL through Prisma (Docker / production-like).
// - Unreachable or DATABASE_URL unset -> built-in in-memory store (quick demo, data resets on restart).
let prisma;
let isPostgresConnected = false;

if (process.env.DATABASE_URL) {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const client = new PrismaClient();
    await Promise.race([
      client.$connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1000))
    ]);
    prisma = client;
    isPostgresConnected = true;
    console.log('Database: PostgreSQL (Prisma)');
  } catch (err) {
    console.warn(`[AI Studio] PostgreSQL not reachable (${err.message}) — falling back to built-in in-memory store`);
  }
}

if (!isPostgresConnected) {
  ({ prisma } = await import('./memory-store.js'));
  console.log('Database: in-memory demo store active');
}

export { prisma };
