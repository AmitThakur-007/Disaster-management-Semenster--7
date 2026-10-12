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
  return { status: response.status, data, cookie: sessionCookie, headers: response.headers };
}

test('auth suite', async (t) => {
  const suffix = randomUUID();
  const testEmail = `user-${suffix}@example.test`;
  const testPassword = 'secure-password-12345';
  let createdUserId = null;
  let residentCookie = null;

  t.after(async () => {
    if (createdUserId) {
      await prisma.session.deleteMany({ where: { userId: createdUserId } });
      await prisma.user.deleteMany({ where: { id: createdUserId } });
    }
    await new Promise(resolve => server.close(resolve));
    await prisma.$disconnect();
  });

  await t.test('unauthenticated /api/auth/me returns 401 without crashing', async () => {
    const res = await request('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.data.error, 'Please sign in.');
  });

  const validPayload = {
    firstName: 'Test',
    lastName: 'Resident',
    email: testEmail,
    phone: '9841234567',
    password: testPassword,
    province: 'Bagmati Province',
    district: 'Kathmandu',
    ward: 'Ward 1',
  };

  await t.test('registration rejects invalid payloads (short password, bad email, missing required fields)', async () => {
    // Short password
    const shortPass = await request('/api/auth/register', 'POST', {
      ...validPayload, password: 'short'
    });
    assert.equal(shortPass.status, 400);

    // Bad email
    const badEmail = await request('/api/auth/register', 'POST', {
      ...validPayload, email: 'not-an-email'
    });
    assert.equal(badEmail.status, 400);

    // Missing first name
    const missingFirstName = await request('/api/auth/register', 'POST', {
      ...validPayload, firstName: ''
    });
    assert.equal(missingFirstName.status, 400);

    // Missing last name
    const missingLastName = await request('/api/auth/register', 'POST', {
      ...validPayload, lastName: ''
    });
    assert.equal(missingLastName.status, 400);

    // Missing phone
    const missingPhone = await request('/api/auth/register', 'POST', {
      ...validPayload, phone: ''
    });
    assert.equal(missingPhone.status, 400);

    // Invalid phone format
    const badPhone = await request('/api/auth/register', 'POST', {
      ...validPayload, phone: '123'
    });
    assert.equal(badPhone.status, 400);

    // Missing province
    const missingProvince = await request('/api/auth/register', 'POST', {
      ...validPayload, province: ''
    });
    assert.equal(missingProvince.status, 400);

    // Missing district
    const missingDistrict = await request('/api/auth/register', 'POST', {
      ...validPayload, district: ''
    });
    assert.equal(missingDistrict.status, 400);

    // District does not belong to province
    const mismatchedDistrict = await request('/api/auth/register', 'POST', {
      ...validPayload, province: 'Bagmati Province', district: 'Jhapa'
    });
    assert.equal(mismatchedDistrict.status, 400);

    // Missing ward
    const missingWard = await request('/api/auth/register', 'POST', {
      ...validPayload, ward: ''
    });
    assert.equal(missingWard.status, 400);
  });

  await t.test('valid registration succeeds and establishes a session cookie', async () => {
    const res = await request('/api/auth/register', 'POST', validPayload);
    assert.equal(res.status, 201);
    assert.ok(res.data.id);
    assert.equal(res.data.name, 'Test Resident');
    assert.equal(res.data.firstName, 'Test');
    assert.equal(res.data.lastName, 'Resident');
    assert.equal(res.data.role, 'RESIDENT');
    assert.equal(res.data.passwordHash, undefined, 'passwordHash must never be exposed');
    assert.ok(res.cookie, 'Session cookie must be set');
    assert.match(res.cookie, /^session=/);

    createdUserId = res.data.id;
    residentCookie = res.cookie;
  });

  await t.test('duplicate registration returns 409 Conflict with clear error message', async () => {
    // Duplicate email
    const res = await request('/api/auth/register', 'POST', {
      ...validPayload, phone: '9841999999'
    });
    assert.equal(res.status, 409);
    assert.equal(res.data.error, 'An account with this email already exists.');
    assert.equal(res.data.code, 'ACCOUNT_EXISTS');

    // Duplicate phone
    const resPhone = await request('/api/auth/register', 'POST', {
      ...validPayload, email: `other-${suffix}@example.test`
    });
    assert.equal(resPhone.status, 409);
    assert.equal(resPhone.data.error, 'An account with this phone number already exists.');
    assert.equal(resPhone.data.code, 'PHONE_EXISTS');
  });

  await t.test('authenticated /api/auth/me returns current user profile safely', async () => {
    const res = await request('/api/auth/me', 'GET', undefined, residentCookie);
    assert.equal(res.status, 200);
    assert.equal(res.data.id, createdUserId);
    assert.equal(res.data.name, 'Test Resident');
    assert.equal(res.data.role, 'RESIDENT');
    assert.equal(res.data.passwordHash, undefined);
  });

  await t.test('authenticated GET and PATCH /api/auth/profile retrieves and updates address', async () => {
    const getRes = await request('/api/auth/profile', 'GET', undefined, residentCookie);
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.id, createdUserId);
    assert.equal(getRes.data.province, 'Bagmati Province');
    assert.equal(getRes.data.district, 'Kathmandu');
    assert.equal(getRes.data.ward, 'Ward 1');
    assert.equal(getRes.data.phone, '9841234567');

    const patchRes = await request('/api/auth/profile', 'PATCH', {
      province: 'Bagmati Province',
      district: 'Kathmandu',
      municipality: 'Kathmandu Metropolitan City',
      ward: 'Ward 16',
      locality: 'Balaju',
      addressLat: 27.734,
      addressLng: 85.305,
    }, residentCookie);
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.data.ward, 'Ward 16');
    assert.equal(patchRes.data.locality, 'Balaju');
    assert.equal(patchRes.data.province, 'Bagmati Province');
    assert.equal(patchRes.data.district, 'Kathmandu');

    // Confirm it persists on subsequent GET
    const confirmRes = await request('/api/auth/profile', 'GET', undefined, residentCookie);
    assert.equal(confirmRes.status, 200);
    assert.equal(confirmRes.data.ward, 'Ward 16');
    assert.equal(confirmRes.data.locality, 'Balaju');
  });

  await t.test('login fails with wrong password or unknown email', async () => {
    const wrongPass = await request('/api/auth/login', 'POST', {
      email: testEmail, password: 'wrong-password-999'
    });
    assert.equal(wrongPass.status, 401);

    const unknownEmail = await request('/api/auth/login', 'POST', {
      email: `unknown-${suffix}@example.test`, password: testPassword
    });
    assert.equal(unknownEmail.status, 401);
  });

  await t.test('login succeeds with correct credentials and returns user and cookie', async () => {
    const res = await request('/api/auth/login', 'POST', {
      email: testEmail, password: testPassword
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.id, createdUserId);
    assert.ok(res.cookie);
  });

  await t.test('logout invalidates session and clears cookie', async () => {
    const logoutRes = await request('/api/auth/logout', 'POST', {}, residentCookie);
    assert.equal(logoutRes.status, 200);
    assert.equal(logoutRes.data.success, true);

    const postLogoutMe = await request('/api/auth/me', 'GET', undefined, residentCookie);
    assert.equal(postLogoutMe.status, 401);
  });
});
