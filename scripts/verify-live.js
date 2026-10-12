import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { prisma } from '../server/db.js';

// Run inside the API container with the worker active. Uses a synthetic report.
const base = 'http://127.0.0.1:3001';
let userId, reportId, photoPath;
async function call(url, method = 'GET', body, cookie) {
  const response = await fetch(`${base}${url}`, { method, headers: {
    ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined });
  const data = await response.json();
  assert.ok(response.ok, data.error || `HTTP ${response.status}`);
  return { data, cookie: response.headers.get('set-cookie')?.split(';')[0] };
}
try {
  const account = await call('/api/auth/register', 'POST', { name: 'Workflow verification',
    email: `check-${randomUUID()}@example.test`, password: randomUUID() });
  userId = account.data.id;
  await call('/api/subscriptions', 'PUT', { areaIds: ['ktm-28'] }, account.cookie);
  const photo = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#224466' } }).png().toBuffer();
  const created = await call('/api/reports', 'POST', { hazard: 'Rising water', areaId: 'ktm-28',
    description: 'Synthetic verification scenario, not a real incident: a resident describes water rising near a road after rain.',
    photo: `data:image/png;base64,${photo.toString('base64')}` }, account.cookie);
  reportId = created.data.id;
  photoPath = (await prisma.report.findUnique({ where: { id: reportId } })).photoPath;
  const deadline = Date.now() + 150000;
  let job;
  while (Date.now() < deadline) {
    job = await prisma.analysisJob.findUnique({ where: { reportId } });
    if (job.status === 'Completed' || job.status === 'Failed') break;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  assert.equal(job.status, 'Completed', job.error || 'Analysis did not finish within the verification window.');
  assert.equal(job.weather.source, 'Open-Meteo');
  assert.ok(job.result.summary);
  const admin = await call('/api/auth/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  const queue = await call('/api/admin/reports', 'GET', undefined, admin.cookie);
  assert.ok(queue.data.find(report => report.id === reportId)?.analysis.result);
  await call(`/api/reports/${reportId}`, 'PATCH', { status: 'Verified' }, admin.cookie);
  const inbox = await call('/api/notifications', 'GET', undefined, account.cookie);
  assert.equal(inbox.data.filter(item => item.reportId === reportId).length, 2);
  console.log(JSON.stringify({ workflow: 'PASS', model: job.model, weather: job.weather.source,
    durationMs: job.result.durationMs, administrativeReview: 'PASS', residentNotifications: 'PASS' }, null, 2));
  await call('/api/auth/logout', 'POST', {}, admin.cookie);
} finally {
  if (reportId) await prisma.report.deleteMany({ where: { id: reportId } });
  if (userId) await prisma.user.deleteMany({ where: { id: userId } });
  if (photoPath) await unlink(path.resolve(process.env.UPLOAD_DIR || './data/uploads', photoPath)).catch(() => {});
  await prisma.$disconnect();
}
