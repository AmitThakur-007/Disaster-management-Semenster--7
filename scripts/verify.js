import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '../server/db.js';
import { createApp } from '../server/app.js';
import { hashPassword } from '../server/auth.js';
import { processNextJob } from '../server/jobs.js';

// Use only this project's database. Test records are isolated and cleaned up.
const suffix = randomUUID();
const areaId = `test-${suffix}`;
const otherAreaId = `other-${suffix}`;
const users = [];
const reportIds = [];
const photos = [];
const server = createApp(prisma).listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;
async function call(url, method = 'GET', body, cookie) {
  const response = await fetch(`${base}${url}`, { method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  return { status: response.status, body: result, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
try {
  await prisma.area.createMany({ data: [
    { id: areaId, name: `Integration area ${suffix}`, latitude: 27.705, longitude: 85.322 },
    { id: otherAreaId, name: `Unassigned area ${suffix}`, latitude: 27.71, longitude: 85.33 },
  ] });
  assert.equal(await prisma.analysisJob.count({ where: { status: { in: ['Pending', 'Processing'] } } }), 0, 'Stop active workers and use a development database with no pending jobs.');
  assert.equal((await call('/api/reports')).status, 401);
  const resident = await call('/api/auth/register', 'POST', { name: 'Test resident', email: `${suffix}@example.test`, password: 'test-password-12345', role: 'ADMIN' });
  users.push(resident.body.id);
  assert.equal(resident.status, 201);
  assert.equal(resident.body.role, 'RESIDENT');
  const cookie = resident.cookie;
  assert.equal((await call('/api/auth/login', 'POST', { email: `${suffix}@example.test`, password: 'incorrect' })).status, 401);
  assert.equal((await call('/api/subscriptions', 'PUT', { areaIds: ['missing'] }, cookie)).status, 400);
  assert.equal((await call('/api/subscriptions', 'PUT', { areaIds: [areaId] }, cookie)).status, 200);
  const admin = await prisma.user.create({ data: { name: 'Test admin', email: `admin-${suffix}@example.test`, role: 'ADMIN', passwordHash: await hashPassword('test-admin-password-123') } });
  users.push(admin.id);
  await prisma.adminArea.create({ data: { userId: admin.id, areaId } });
  const login = await call('/api/auth/login', 'POST', { email: admin.email, password: 'test-admin-password-123' });
  assert.equal(login.status, 200);
  const adminCookie = login.cookie;
  const image = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#224466' } }).png().toBuffer();
  const payload = { hazard: 'Rising water', areaId, description: 'Water appears higher beside the road.', photo: `data:image/png;base64,${image.toString('base64')}` };
  const created = await call('/api/reports', 'POST', payload, cookie);
  assert.equal(created.status, 201);
  reportIds.push(created.body.id);
  const report = await prisma.report.findUnique({ where: { id: created.body.id }, include: { job: true } });
  photos.push(report.photoPath);
  assert.equal(report.job.status, 'Pending');
  assert.equal((await call('/api/notifications', 'GET', undefined, cookie)).body.filter(item => item.reportId === report.id).length, 1);
  assert.equal((await call('/api/notifications', 'GET', undefined, adminCookie)).body.filter(item => item.reportId === report.id).length, 1);
  assert.equal((await call(`/api/reports/${report.id}`, 'PATCH', { status: 'Resolved' }, cookie)).status, 403);
  assert.equal((await call('/api/admin/reports', 'GET', undefined, cookie)).status, 403);
  assert.equal((await call(`/api/reports/${report.id}`, 'PATCH', { status: 'Verified' }, adminCookie)).status, 200);
  assert.equal((await call(`/api/reports/${report.id}`, 'PATCH', { status: 'Resolved' }, adminCookie)).status, 409, 'resolution requires an acknowledged response and Responding status');
  assert.equal(await prisma.review.count({ where: { reportId: report.id } }), 1);
  const other = await call('/api/reports', 'POST', { ...payload, areaId: otherAreaId }, cookie);
  reportIds.push(other.body.id);
  photos.push((await prisma.report.findUnique({ where: { id: other.body.id } })).photoPath);
  assert.equal((await call(`/api/reports/${other.body.id}`, 'PATCH', { status: 'Resolved' }, adminCookie)).status, 404);
  const photoResponse = await fetch(`${base}/api/reports/${report.id}/photo`, { headers: { Cookie: cookie } });
  assert.equal(photoResponse.status, 200);
  assert.match(photoResponse.headers.get('content-type'), /image\/jpeg/);
  const weather = { source: 'Test weather', daily: {} };
  // Keep all non-test jobs untouched during this check.
  await prisma.analysisJob.updateMany({ where: { reportId: { in: reportIds } }, data: { availableAt: new Date(0) } });
  await processNextJob(prisma, { getWeather: async () => weather,
    assessReport: async () => ({ summary: 'Test context', model: 'test-model' }) });
  const completed = await prisma.analysisJob.findFirst({ where: { reportId: { in: reportIds }, status: 'Completed' } });
  assert.ok(completed);
  const community = (await call('/api/reports', 'GET', undefined, cookie)).body.find(item => item.id === completed.reportId);
  assert.equal(community.analysis.result, undefined);
  const privateView = (await call('/api/admin/reports', 'GET', undefined, adminCookie)).body.find(item => item.id === completed.reportId);
  if (privateView) assert.equal(privateView.analysis.result.summary, 'Test context');
  const pending = await prisma.analysisJob.findFirst({ where: { reportId: { in: reportIds }, status: 'Pending' } });
  await prisma.analysisJob.update({ where: { id: pending.id }, data: { attempts: 2, availableAt: new Date(0) } });
  await processNextJob(prisma, { getWeather: async () => { throw new Error('Test service unavailable'); }, assessReport: async () => ({}) });
  assert.equal((await prisma.analysisJob.findUnique({ where: { id: pending.id } })).status, 'Failed');
  assert.equal((await call('/api/auth/logout', 'POST', {}, cookie)).status, 200);
  assert.equal((await call('/api/reports', 'GET', undefined, cookie)).status, 401);
  console.log('PASS: authentication, role and area permissions, uploads, notifications, audit history, worker completion and failure, assessment privacy, logout.');
} finally {
  await prisma.incidentAssignment.deleteMany({ where: { reportId: { in: reportIds } } });
  await prisma.incidentEvent.deleteMany({ where: { reportId: { in: reportIds } } });
  await prisma.report.deleteMany({ where: { id: { in: reportIds } } });
  await prisma.user.deleteMany({ where: { id: { in: users } } });
  await prisma.area.deleteMany({ where: { id: { in: [areaId, otherAreaId] } } });
  for (const photo of photos) await unlink(path.resolve(process.env.UPLOAD_DIR || './data/uploads', photo)).catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await prisma.$disconnect();
}

