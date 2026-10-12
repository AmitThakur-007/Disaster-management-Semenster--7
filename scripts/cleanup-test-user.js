import { prisma } from '../server/db.js';

await prisma.session.deleteMany({ where: { user: { email: 'citizen@example.test' } } });
await prisma.user.deleteMany({ where: { email: 'citizen@example.test' } });
await prisma.$disconnect();
console.log('Cleaned up synthetic test user.');
