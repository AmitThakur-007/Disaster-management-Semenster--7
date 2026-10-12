import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID } from 'node:crypto';
import { prisma } from './db.js';
import { createApp } from './app.js';
import { hashPassword } from './auth.js';

const app = createApp(prisma);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

async function request(url, method = 'GET', body, cookie) {
  const response = await fetch(`${base}${url}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  const setCookie = response.headers.get('set-cookie');
  const sessionCookie = setCookie ? setCookie.split(';')[0] : undefined;
  return { status: response.status, data, cookie: sessionCookie };
}

test('admin management suite (roles, teams, search)', async (t) => {
  const suffix = randomUUID().slice(0, 8);
  const adminPassword = 'AdminPassword123!';
  const adminEmail = `admin-${suffix}@disasterwatch.np`;
  const citizenPassword = 'CitizenPassword123!';
  const citizenEmail = `citizen-${suffix}@example.com`;
  const responderEmail = `responder-${suffix}@example.com`;

  let adminCookie = null;
  let citizenCookie = null;
  let adminUser = null;
  let citizenUser = null;
  let responderUser = null;
  let testOrgId = null;
  let testTeamId = null;

  t.before(async () => {
    // 1. Create an admin user
    adminUser = await prisma.user.create({
      data: {
        name: 'Super Admin Test',
        firstName: 'Super',
        lastName: 'Admin',
        email: adminEmail,
        phone: '9841000001',
        passwordHash: await hashPassword(adminPassword),
        role: 'ADMIN',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        ward: 'Ward 1',
      }
    });

    // 2. Create a resident (citizen) user
    citizenUser = await prisma.user.create({
      data: {
        name: 'Ram Bahadur',
        firstName: 'Ram',
        lastName: 'Bahadur',
        email: citizenEmail,
        phone: '9841112233',
        passwordHash: await hashPassword(citizenPassword),
        role: 'RESIDENT',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        ward: 'Ward 16',
      }
    });

    // 3. Create a responder user
    responderUser = await prisma.user.create({
      data: {
        name: 'Sita Sharma',
        firstName: 'Sita',
        lastName: 'Sharma',
        email: responderEmail,
        phone: '9851223344',
        passwordHash: await hashPassword(citizenPassword),
        role: 'RESPONDER',
        province: 'Bagmati Province',
        district: 'Lalitpur',
        ward: 'Ward 3',
      }
    });

    // Login as admin
    const adminLogin = await request('/api/auth/login', 'POST', { email: adminEmail, password: adminPassword });
    assert.equal(adminLogin.status, 200);
    adminCookie = adminLogin.cookie;

    // Login as citizen
    const citizenLogin = await request('/api/auth/login', 'POST', { email: citizenEmail, password: citizenPassword });
    assert.equal(citizenLogin.status, 200);
    citizenCookie = citizenLogin.cookie;

    // Create a test organization and team
    const orgRes = await request('/api/admin/organizations', 'POST', {
      name: `Nepal Search Unit ${suffix}`,
      type: 'Rescue and Relief'
    }, adminCookie);
    assert.equal(orgRes.status, 201);
    testOrgId = orgRes.data.id;

    const teamRes = await request(`/api/admin/organizations/${testOrgId}/teams`, 'POST', {
      name: `Alpha Squad ${suffix}`
    }, adminCookie);
    assert.equal(teamRes.status, 201);
    testTeamId = teamRes.data.id;
  });

  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  });

  // ── Role Changer Tests ──────────────────────────────────────────────
  await t.test('admin can promote Citizen to Responder', async () => {
    const res = await request(`/api/admin/users/${citizenUser.id}/role`, 'PATCH', { role: 'RESPONDER' }, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.role, 'RESPONDER');

    // Verify persistence
    const updated = await prisma.user.findUnique({ where: { id: citizenUser.id } });
    assert.equal(updated.role, 'RESPONDER');
  });

  await t.test('admin can demote Responder back to Citizen', async () => {
    const res = await request(`/api/admin/users/${citizenUser.id}/role`, 'PATCH', { role: 'RESIDENT' }, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.role, 'RESIDENT');

    const updated = await prisma.user.findUnique({ where: { id: citizenUser.id } });
    assert.equal(updated.role, 'RESIDENT');
  });

  await t.test('role changer rejects roles outside Citizen and Responder', async () => {
    const resAdmin = await request(`/api/admin/users/${citizenUser.id}/role`, 'PATCH', { role: 'ADMIN' }, adminCookie);
    assert.equal(resAdmin.status, 400);

    const resSuper = await request(`/api/admin/users/${citizenUser.id}/role`, 'PATCH', { role: 'SUPERADMIN' }, adminCookie);
    assert.equal(resSuper.status, 400);

    const resInvalid = await request(`/api/admin/users/${citizenUser.id}/role`, 'PATCH', { role: 'HACKER' }, adminCookie);
    assert.equal(resInvalid.status, 400);
  });

  await t.test('admin cannot change own role', async () => {
    const res = await request(`/api/admin/users/${adminUser.id}/role`, 'PATCH', { role: 'RESIDENT' }, adminCookie);
    assert.equal(res.status, 400);
    assert.match(res.data.error, /cannot change your own role/i);
  });

  await t.test('privileged accounts (ADMIN/SUPERADMIN) cannot be demoted via role changer', async () => {
    // Create another admin to attempt demoting
    const otherAdmin = await prisma.user.create({
      data: {
        name: 'Protected Admin',
        email: `other-admin-${suffix}@disasterwatch.np`,
        passwordHash: await hashPassword(adminPassword),
        role: 'ADMIN',
      }
    });

    const res = await request(`/api/admin/users/${otherAdmin.id}/role`, 'PATCH', { role: 'RESIDENT' }, adminCookie);
    assert.equal(res.status, 403);
    assert.match(res.data.error, /privileged/i);
  });

  await t.test('non-admin user cannot change roles', async () => {
    const res = await request(`/api/admin/users/${responderUser.id}/role`, 'PATCH', { role: 'RESIDENT' }, citizenCookie);
    assert.equal(res.status, 403);
  });

  // ── Organization Team Management Tests ──────────────────────────────
  await t.test('admin can search eligible responders', async () => {
    const res = await request(`/api/admin/responders?search=Sita`, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    const found = res.data.find(r => r.id === responderUser.id);
    assert.ok(found, 'Eligible responder Sita should be in search results');
    assert.equal(found.role, 'RESPONDER');
  });

  await t.test('non-responders are not included in eligible responders list', async () => {
    const res = await request(`/api/admin/responders?search=Ram`, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    const found = res.data.find(r => r.id === citizenUser.id);
    assert.equal(found, undefined, 'Resident Ram should NOT appear in eligible responders list');
  });

  await t.test('admin can add eligible Responder to a team', async () => {
    const res = await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'PUT', {}, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);

    // Verify member exists in team
    const members = await prisma.teamMember.findMany({ where: { teamId: testTeamId, userId: responderUser.id } });
    assert.equal(members.length, 1);
  });

  await t.test('adding duplicate team membership succeeds idempotently', async () => {
    const res = await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'PUT', {}, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);

    const members = await prisma.teamMember.findMany({ where: { teamId: testTeamId, userId: responderUser.id } });
    assert.equal(members.length, 1);
  });

  await t.test('rejects adding Citizen (RESIDENT) to a team', async () => {
    const res = await request(`/api/admin/teams/${testTeamId}/members/${citizenUser.id}`, 'PUT', {}, adminCookie);
    assert.equal(res.status, 400);
    assert.match(res.data.error, /responder role/i);
  });

  await t.test('rejects adding ADMIN to a team', async () => {
    const res = await request(`/api/admin/teams/${testTeamId}/members/${adminUser.id}`, 'PUT', {}, adminCookie);
    assert.equal(res.status, 400);
    assert.match(res.data.error, /responder role/i);
  });

  await t.test('admin can remove member from team', async () => {
    const res = await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'DELETE', undefined, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);

    const members = await prisma.teamMember.findMany({ where: { teamId: testTeamId, userId: responderUser.id } });
    assert.equal(members.length, 0);
  });

  await t.test('non-admin cannot add or remove team members', async () => {
    const putRes = await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'PUT', {}, citizenCookie);
    assert.equal(putRes.status, 403);

    const delRes = await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'DELETE', undefined, citizenCookie);
    assert.equal(delRes.status, 403);
  });

  // ── Administrator User Search Tests ─────────────────────────────────
  await t.test('search finds users by exact and partial phone number', async () => {
    // Exact phone
    const resExact = await request(`/api/admin/users?search=9841112233`, 'GET', undefined, adminCookie);
    assert.equal(resExact.status, 200);
    assert.ok(resExact.data.users.some(u => u.id === citizenUser.id));

    // Partial phone
    const resPartial = await request(`/api/admin/users?search=112233`, 'GET', undefined, adminCookie);
    assert.equal(resPartial.status, 200);
    assert.ok(resPartial.data.users.some(u => u.id === citizenUser.id));
  });

  await t.test('search finds users by exact and partial email', async () => {
    // Partial email
    const prefix = citizenEmail.split('@')[0];
    const res = await request(`/api/admin/users?search=${prefix}`, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    assert.ok(res.data.users.some(u => u.id === citizenUser.id));
  });

  await t.test('search finds users by first name, surname, or full name', async () => {
    // First name
    const resFirst = await request(`/api/admin/users?search=Ram`, 'GET', undefined, adminCookie);
    assert.equal(resFirst.status, 200);
    assert.ok(resFirst.data.users.some(u => u.id === citizenUser.id));

    // Surname
    const resLast = await request(`/api/admin/users?search=Bahadur`, 'GET', undefined, adminCookie);
    assert.equal(resLast.status, 200);
    assert.ok(resLast.data.users.some(u => u.id === citizenUser.id));
  });

  await t.test('user search normalizes whitespace and ignores casing', async () => {
    const res = await request(`/api/admin/users?search=   ram   `, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    assert.ok(res.data.users.some(u => u.id === citizenUser.id));
  });

  await t.test('user search returns empty array gracefully when no match', async () => {
    const res = await request(`/api/admin/users?search=nonexistent_xyz_999999`, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.users.length, 0);
    assert.equal(res.data.total, 0);
  });

  await t.test('user search never exposes passwordHash or sensitive fields', async () => {
    const res = await request(`/api/admin/users?search=Ram`, 'GET', undefined, adminCookie);
    assert.equal(res.status, 200);
    const user = res.data.users.find(u => u.id === citizenUser.id);
    assert.ok(user);
    assert.equal(user.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.equal(user.sessions, undefined);
  });

  await t.test('non-admin user is rejected from administrator search', async () => {
    const res = await request(`/api/admin/users?search=Ram`, 'GET', undefined, citizenCookie);
    assert.equal(res.status, 403);
  });
});
