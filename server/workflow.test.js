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

test('complete disaster report verification and response workflow suite', async (t) => {
  const suffix = randomUUID().slice(0, 8);
  const adminPassword = 'AdminPassword123!';
  const adminEmail = `admin-wf-${suffix}@disasterwatch.np`;
  const citizenPassword = 'CitizenPassword123!';
  const citizenEmail = `citizen-wf-${suffix}@example.com`;
  const responderPassword = 'ResponderPassword123!';
  const responderEmail = `responder-wf-${suffix}@example.com`;
  const otherResponderEmail = `other-resp-${suffix}@example.com`;

  let adminCookie = null;
  let citizenCookie = null;
  let responderCookie = null;
  let otherResponderCookie = null;

  let adminUser = null;
  let citizenUser = null;
  let responderUser = null;
  let otherResponderUser = null;

  let testOrgId = null;
  let testTeamId = null;
  let testArea = null;
  let reportId = null;
  let assignmentId = null;

  t.before(async () => {
    // 1. Ensure test area exists
    testArea = await prisma.area.upsert({
      where: { id: 'ktm-28' },
      create: { id: 'ktm-28', name: 'Kathmandu Metropolitan City — Ward 28', latitude: 27.705, longitude: 85.322 },
      update: {}
    });

    // 2. Admin user
    adminUser = await prisma.user.create({
      data: {
        name: 'Workflow Admin',
        firstName: 'Workflow',
        lastName: 'Admin',
        email: adminEmail,
        phone: `9841${Math.floor(100000 + Math.random() * 900000)}`,
        passwordHash: await hashPassword(adminPassword),
        role: 'ADMIN',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        ward: 'Ward 28',
      }
    });
    await prisma.adminArea.upsert({
      where: { userId_areaId: { userId: adminUser.id, areaId: testArea.id } },
      create: { userId: adminUser.id, areaId: testArea.id },
      update: {}
    });

    // 3. Citizen user
    citizenUser = await prisma.user.create({
      data: {
        name: 'Report Citizen',
        firstName: 'Report',
        lastName: 'Citizen',
        email: citizenEmail,
        phone: `9842${Math.floor(100000 + Math.random() * 900000)}`,
        passwordHash: await hashPassword(citizenPassword),
        role: 'RESIDENT',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        ward: 'Ward 28',
      }
    });

    // 4. Responder user
    responderUser = await prisma.user.create({
      data: {
        name: 'Field Responder',
        firstName: 'Field',
        lastName: 'Responder',
        email: responderEmail,
        phone: `9843${Math.floor(100000 + Math.random() * 900000)}`,
        passwordHash: await hashPassword(responderPassword),
        role: 'RESPONDER',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        ward: 'Ward 28',
      }
    });

    // 5. Unassigned Responder
    otherResponderUser = await prisma.user.create({
      data: {
        name: 'Other Responder',
        firstName: 'Other',
        lastName: 'Responder',
        email: otherResponderEmail,
        phone: `9844${Math.floor(100000 + Math.random() * 900000)}`,
        passwordHash: await hashPassword(responderPassword),
        role: 'RESPONDER',
      }
    });

    // 6. Logins
    const adminLogin = await request('/api/auth/login', 'POST', { email: adminEmail, password: adminPassword });
    adminCookie = adminLogin.cookie;

    const citizenLogin = await request('/api/auth/login', 'POST', { email: citizenEmail, password: citizenPassword });
    citizenCookie = citizenLogin.cookie;

    const responderLogin = await request('/api/auth/login', 'POST', { email: responderEmail, password: responderPassword });
    responderCookie = responderLogin.cookie;

    const otherResponderLogin = await request('/api/auth/login', 'POST', { email: otherResponderEmail, password: responderPassword });
    otherResponderCookie = otherResponderLogin.cookie;

    // 7. Setup Org & Team via Admin API
    const orgRes = await request('/api/admin/organizations', 'POST', {
      name: `Nepal Rescue Unit ${suffix}`,
      type: 'Search and Rescue',
      jurisdiction: 'Kathmandu Valley'
    }, adminCookie);
    testOrgId = orgRes.data.id;

    const teamRes = await request(`/api/admin/organizations/${testOrgId}/teams`, 'POST', {
      name: `Alpha Squad ${suffix}`
    }, adminCookie);
    testTeamId = teamRes.data.id;

    // Add responder to team
    await request(`/api/admin/teams/${testTeamId}/members/${responderUser.id}`, 'PUT', {}, adminCookie);
  });

  await t.test('1. Citizen submits a disaster report (status: Reported, event logged, notifications created)', async () => {
    // 1x1 valid PNG signature
    const validPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await request('/api/reports', 'POST', {
      hazard: 'Rising water',
      areaId: testArea.id,
      province: 'Bagmati Province',
      district: 'Kathmandu',
      ward: 'Ward 28',
      locality: 'Putalisadak Bridge corridor',
      description: 'Water overflowing over drainage wall near old bridge.',
      severity: 'High',
      photo: validPng
    }, citizenCookie);

    assert.equal(res.status, 201);
    assert.ok(res.data.id);
    reportId = res.data.id;

    // Verify initial status
    const reportRecord = await prisma.report.findUnique({ where: { id: reportId }, include: { events: true } });
    assert.equal(reportRecord.status, 'Reported');
    assert.equal(reportRecord.severity, 'High');
    assert.ok(reportRecord.events.some(e => e.type === 'REPORT_SUBMITTED' && e.newStatus === 'Reported'));
  });

  await t.test('2. Admin reviews report, updates priority and assignment instructions', async () => {
    const res = await request(`/api/reports/${reportId}`, 'PATCH', {
      priority: 'High',
      assignmentInstructions: 'Assess bridge foundation and storm drain backflow immediately.'
    }, adminCookie);

    assert.equal(res.status, 200);
    const updated = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(updated.priority, 'High');
    assert.equal(updated.assignmentInstructions, 'Assess bridge foundation and storm drain backflow immediately.');
  });

  await t.test('3. Admin can mark report InReview for investigation', async () => {
    const res = await request(`/api/reports/${reportId}`, 'PATCH', {
      status: 'InReview'
    }, adminCookie);

    assert.equal(res.status, 200);
    const updated = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(updated.status, 'InReview');
  });

  await t.test('4. Admin assigns responder team to the report', async () => {
    const res = await request(`/api/reports/${reportId}/assignments`, 'POST', {
      teamId: testTeamId,
      instructions: 'Conduct immediate on-site safety assessment.'
    }, adminCookie);

    assert.equal(res.status, 201);
    assert.ok(res.data.id);
    assignmentId = res.data.id;

    // Check notification was sent to responder
    const notifs = await prisma.notification.findMany({ where: { userId: responderUser.id, reportId } });
    assert.ok(notifs.length > 0);
    assert.match(notifs[0].message, /Incident assigned/);

    // Duplicate assignment rejected with 409
    const dupRes = await request(`/api/reports/${reportId}/assignments`, 'POST', { teamId: testTeamId }, adminCookie);
    assert.equal(dupRes.status, 409);
  });

  await t.test('5. Responder views assigned reports and unauthorized responder is denied access', async () => {
    // Assigned responder sees the report
    const assignedRes = await request('/api/responder/assignments', 'GET', undefined, responderCookie);
    assert.equal(assignedRes.status, 200);
    assert.ok(assignedRes.data.some(a => a.id === assignmentId && a.reportId === reportId));

    // Full detail endpoint allows assigned responder
    const detailRes = await request(`/api/responder/reports/${reportId}`, 'GET', undefined, responderCookie);
    assert.equal(detailRes.status, 200);
    assert.equal(detailRes.data.id, reportId);

    // Unassigned responder is denied access (403)
    const deniedRes = await request(`/api/responder/reports/${reportId}`, 'GET', undefined, otherResponderCookie);
    assert.equal(deniedRes.status, 403);
  });

  await t.test('6. Responder acknowledges assignment', async () => {
    // Non-member cannot acknowledge
    const deniedAck = await request(`/api/assignments/${assignmentId}/acknowledge`, 'POST', {}, otherResponderCookie);
    assert.equal(deniedAck.status, 403);

    // Assigned responder acknowledges
    const ackRes = await request(`/api/assignments/${assignmentId}/acknowledge`, 'POST', {}, responderCookie);
    assert.equal(ackRes.status, 200);

    // Double acknowledge rejected
    const dupAck = await request(`/api/assignments/${assignmentId}/acknowledge`, 'POST', {}, responderCookie);
    assert.equal(dupAck.status, 409);

    // Audit event ASSIGNMENT_ACKNOWLEDGED logged
    const events = await prisma.incidentEvent.findMany({ where: { reportId, type: 'ASSIGNMENT_ACKNOWLEDGED' } });
    assert.equal(events.length, 1);
  });

  await t.test('7. Responder submits verification recommendation (and unassigned user is rejected)', async () => {
    // Unassigned responder cannot submit recommendation
    const deniedRec = await request(`/api/reports/${reportId}/recommendations`, 'POST', {
      recommendation: 'Recommend Verified',
      reason: 'Looks severe.'
    }, otherResponderCookie);
    assert.equal(deniedRec.status, 403);

    // Citizen cannot submit recommendation
    const citizenRec = await request(`/api/reports/${reportId}/recommendations`, 'POST', {
      recommendation: 'Recommend Verified',
      reason: 'Citizen note.'
    }, citizenCookie);
    assert.equal(citizenRec.status, 403);

    // Assigned responder submits recommendation
    const recRes = await request(`/api/reports/${reportId}/recommendations`, 'POST', {
      recommendation: 'Recommend Verified',
      reason: 'Confirmed water level 1.8m above normal baseline, storm culverts submerged.',
      observations: 'Roadway pedestrian sidewalk closed. Local ward police managing traffic detour.',
      visitedAt: new Date().toISOString()
    }, responderCookie);

    assert.equal(recRes.status, 201);
    assert.ok(recRes.data.id);
    assert.equal(recRes.data.recommendation, 'Recommend Verified');

    // Admin received notification
    const adminNotifs = await prisma.notification.findMany({ where: { userId: adminUser.id, reportId } });
    assert.ok(adminNotifs.some(n => n.message.includes('recommendation submitted')));
  });

  await t.test('8. Responder cannot approve recommendation or alter report status directly (403)', async () => {
    const res = await request(`/api/reports/${reportId}`, 'PATCH', { status: 'Verified' }, responderCookie);
    assert.equal(res.status, 403);
  });

  await t.test('9. Admin reviews recommendation and makes final decision: Verifies report', async () => {
    const res = await request(`/api/reports/${reportId}`, 'PATCH', { status: 'Verified' }, adminCookie);
    assert.equal(res.status, 200);

    const verified = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(verified.status, 'Verified');
    assert.equal(verified.verifierId, adminUser.id);
    assert.ok(verified.verifiedAt);

    // Event STATUS_VERIFIED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'STATUS_VERIFIED' } });
    assert.ok(event);

    // Reporter was notified
    const reporterNotifs = await prisma.notification.findMany({ where: { userId: citizenUser.id, reportId } });
    assert.ok(reporterNotifs.some(n => /verified/i.test(n.message)));
  });

  await t.test('10. Admin authorizes dispatch after verification', async () => {
    // Responder cannot authorize dispatch
    const respDispatch = await request(`/api/assignments/${assignmentId}/dispatch`, 'POST', {}, responderCookie);
    assert.equal(respDispatch.status, 403);

    // Admin authorizes dispatch
    const res = await request(`/api/assignments/${assignmentId}/dispatch`, 'POST', {}, adminCookie);
    assert.equal(res.status, 200);

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(report.status, 'Dispatched');

    const assign = await prisma.incidentAssignment.findUnique({ where: { id: assignmentId } });
    assert.ok(assign.dispatchedAt);

    // Event STATUS_DISPATCHED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'STATUS_DISPATCHED' } });
    assert.ok(event);
  });

  await t.test('11. Responder records response progress and mobilizes on-scene', async () => {
    // 1. Move to Responding
    const respRes = await request(`/api/assignments/${assignmentId}/responding`, 'POST', {
      note: 'Team arrived on site with mobile pumps and sandbags.'
    }, responderCookie);
    assert.equal(respRes.status, 200);

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(report.status, 'Responding');

    // 2. Update progress note
    const progRes = await request(`/api/assignments/${assignmentId}/progress`, 'PATCH', {
      note: 'Pumping operations underway. Water level stabilized.'
    }, responderCookie);
    assert.equal(progRes.status, 200);

    const assign = await prisma.incidentAssignment.findUnique({ where: { id: assignmentId } });
    assert.equal(assign.progressNote, 'Pumping operations underway. Water level stabilized.');

    // Event PROGRESS_UPDATED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'PROGRESS_UPDATED' } });
    assert.ok(event);
  });

  await t.test('12. Admin reviews outcome and resolves incident with resolution summary', async () => {
    // Missing resolution summary rejected
    const badRes = await request(`/api/reports/${reportId}`, 'PATCH', { status: 'Resolved' }, adminCookie);
    assert.equal(badRes.status, 400);

    // Valid resolution
    const res = await request(`/api/reports/${reportId}`, 'PATCH', {
      status: 'Resolved',
      resolutionSummary: 'Culverts cleared, sandbag berms placed, road safe for pedestrian access.'
    }, adminCookie);
    assert.equal(res.status, 200);

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(report.status, 'Resolved');
    assert.equal(report.resolutionSummary, 'Culverts cleared, sandbag berms placed, road safe for pedestrian access.');

    // Event STATUS_RESOLVED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'STATUS_RESOLVED' } });
    assert.ok(event);
  });

  await t.test('13. Reopening with audit record requires mandatory reason', async () => {
    // Missing reopen reason rejected
    const badReopen = await request(`/api/reports/${reportId}`, 'PATCH', { status: 'Reported' }, adminCookie);
    assert.equal(badReopen.status, 400);

    // Valid reopen
    const res = await request(`/api/reports/${reportId}`, 'PATCH', {
      status: 'Reported',
      reopenReason: 'Follow-up inspection required due to secondary rain forecast.'
    }, adminCookie);
    assert.equal(res.status, 200);

    const report = await prisma.report.findUnique({ where: { id: reportId } });
    assert.equal(report.status, 'Reported');
    assert.equal(report.reopenReason, 'Follow-up inspection required due to secondary rain forecast.');
    assert.ok(report.reopenedAt);

    // Event STATUS_REPORTED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'STATUS_REPORTED' } });
    assert.ok(event);
  });

  await t.test('14. Admin can reassign / unassign active assignment with audit event', async () => {
    // Non-admin cannot unassign
    const deniedDel = await request(`/api/assignments/${assignmentId}`, 'DELETE', undefined, responderCookie);
    assert.equal(deniedDel.status, 403);

    // Admin unassigns
    const delRes = await request(`/api/assignments/${assignmentId}`, 'DELETE', undefined, adminCookie);
    assert.equal(delRes.status, 200);

    const assign = await prisma.incidentAssignment.findUnique({ where: { id: assignmentId } });
    assert.equal(assign.active, false);

    // Event TEAM_UNASSIGNED logged
    const event = await prisma.incidentEvent.findFirst({ where: { reportId, type: 'TEAM_UNASSIGNED' } });
    assert.ok(event);
  });

  await t.test('15. Public incidents endpoint never exposes rejected reports', async () => {
    // Create a rejected report
    const rejReport = await prisma.report.create({
      data: {
        hazard: 'Other concern',
        description: 'Test rejected incident.',
        photoPath: 'none.jpg',
        areaId: testArea.id,
        reporterId: citizenUser.id,
        status: 'Rejected',
        rejectionReason: 'Not an emergency.'
      }
    });

    const pubRes = await request('/api/public/incidents', 'GET');
    assert.equal(pubRes.status, 200);
    assert.ok(!pubRes.data.some(r => r.id === rejReport.id || r.status === 'Rejected'));

    const pubRejRes = await request('/api/public/incidents?status=Rejected', 'GET');
    assert.equal(pubRejRes.status, 200);
    assert.equal(pubRejRes.data.length, 0);
  });

  t.after(async () => {
    server.close();
  });
});
