import '../server/env.js';
import { prisma } from '../server/db.js';
import { hashPassword } from '../server/auth.js';

// Coordinates are representative ward centres, not the report's exact location.
const areas = [
  { id: 'ktm-28', name: 'Kathmandu Metropolitan City — Ward 28', latitude: 27.705, longitude: 85.322 },
  { id: 'ktm-29', name: 'Kathmandu Metropolitan City — Ward 29', latitude: 27.714, longitude: 85.325 },
  { id: 'ktm-01', name: 'Kathmandu Metropolitan City — Ward 1 (Naxal)', latitude: 27.717, longitude: 85.329 },
  { id: 'ktm-03', name: 'Kathmandu Metropolitan City — Ward 3 (Maharajgunj)', latitude: 27.736, longitude: 85.330 },
  { id: 'lal-01', name: 'Lalitpur Metropolitan City — Ward 1 (Kupondole)', latitude: 27.687, longitude: 85.317 },
];
try {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set. Seeding needs the PostgreSQL database.');
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || password === 'replace-with-a-strong-password') {
    throw new Error('Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 12 characters before seeding.');
  }
  for (const area of areas) await prisma.area.upsert({ where: { id: area.id }, create: area, update: area });
  const admin = await prisma.user.upsert({ where: { email },
    create: { email, name: 'Area Administrator', passwordHash: await hashPassword(password), role: 'ADMIN' },
    update: {} });
  if (admin.role !== 'ADMIN') throw new Error('ADMIN_EMAIL belongs to a resident. Choose a different email.');
  for (const area of areas) await prisma.adminArea.upsert({
    where: { userId_areaId: { userId: admin.id, areaId: area.id } },
    create: { userId: admin.id, areaId: area.id }, update: {} });

  // Demo responder, organization and team so the assignment workflow can be tried immediately.
  const responder = await prisma.user.upsert({ where: { email: 'responder@disasterwatch.np' },
    create: { email: 'responder@disasterwatch.np', name: 'Bikash Shrestha (Lead Responder)',
      passwordHash: await hashPassword('ResponderPass123!'), role: 'RESPONDER' },
    update: {} });
  const org = await prisma.responseOrganization.upsert({ where: { name: 'Nepal Red Cross Society' },
    create: { name: 'Nepal Red Cross Society', type: 'Disaster Relief & Search/Rescue',
      jurisdiction: 'Kathmandu Valley', createdById: admin.id },
    update: {} });
  const team = await prisma.responseTeam.upsert({
    where: { organizationId_name: { organizationId: org.id, name: 'Kathmandu Quick Response Unit 1' } },
    create: { organizationId: org.id, name: 'Kathmandu Quick Response Unit 1' }, update: {} });
  await prisma.teamMember.upsert({ where: { teamId_userId: { teamId: team.id, userId: responder.id } },
    create: { teamId: team.id, userId: responder.id }, update: {} });
  console.log('Seed complete: wards, administrator, demo responder, organization and team are ready.');
} finally { await prisma.$disconnect(); }
