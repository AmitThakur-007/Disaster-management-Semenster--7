import { prisma } from '../server/db.js';

const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true, role: true, createdAt: true }
});
console.log('Existing users in DB:');
console.table(users);
await prisma.$disconnect();
