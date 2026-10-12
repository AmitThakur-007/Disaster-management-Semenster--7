import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { once } from 'node:events';
import { prisma } from './db.js';
import { createApp } from './app.js';

const app = createApp(prisma);
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const base = `http://127.0.0.1:${server.address().port}`;

async function get(url) {
  const response = await fetch(`${base}${url}`);
  const data = await response.json();
  return { status: response.status, data };
}

test('live incidents public API and frontend contract suite', async (t) => {
  t.after(() => {
    server.close();
  });

  await t.test('1. /api/public/incidents returns real records with administrative fields and rounded coords', async () => {
    const res = await get('/api/public/incidents');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.data.length > 0, 'Seeded reports must be present');

    const sample = res.data[0];
    assert.ok(sample.id);
    assert.ok(sample.hazard);
    assert.ok(sample.severity);
    assert.ok(sample.status);
    assert.ok(sample.createdAt);

    // Check privacy: reporterId, photoPath, and locality must NOT be exposed
    assert.equal(sample.reporterId, undefined, 'reporterId must be withheld for privacy');
    assert.equal(sample.photoPath, undefined, 'photoPath must be withheld in public list');
    assert.equal(sample.locality, undefined, 'street locality must be withheld');

    // If coordinates exist, they must be rounded to at most 2 decimals (~1km ward precision)
    if (sample.latitude != null) {
      const latDecimals = (String(sample.latitude).split('.')[1] || '').length;
      assert.ok(latDecimals <= 2, `Latitude decimals should be <= 2, got ${latDecimals}`);
    }
  });

  await t.test('2. /api/public/incidents filters accurately by hazard and severity', async () => {
    const floodRes = await get('/api/public/incidents?hazard=Flood');
    assert.equal(floodRes.status, 200);
    for (const inc of floodRes.data) {
      assert.equal(inc.hazard, 'Flood');
    }

    const highRes = await get('/api/public/incidents?severity=High');
    assert.equal(highRes.status, 200);
    for (const inc of highRes.data) {
      assert.equal(inc.severity, 'High');
    }
  });

  await t.test('3. /api/public/incidents excludes Rejected reports', async () => {
    // Direct status=Rejected query returns empty array
    const rejRes = await get('/api/public/incidents?status=Rejected');
    assert.equal(rejRes.status, 200);
    assert.deepEqual(rejRes.data, []);

    // General list contains no rejected reports
    const allRes = await get('/api/public/incidents');
    assert.equal(allRes.status, 200);
    const hasRejected = allRes.data.some(i => i.status === 'Rejected');
    assert.equal(hasRejected, false, 'Rejected reports must never appear in public feed');
  });

  await t.test('4. /api/public/incidents supports province and district query filtering', async () => {
    // Seed Gandaki report exists
    const gandakiRes = await get('/api/public/incidents?province=Gandaki%20Province');
    assert.equal(gandakiRes.status, 200);
    for (const inc of gandakiRes.data) {
      assert.equal(inc.province, 'Gandaki Province');
    }

    const kaskiRes = await get('/api/public/incidents?district=Kaski');
    assert.equal(kaskiRes.status, 200);
    for (const inc of kaskiRes.data) {
      assert.equal(inc.district, 'Kaski');
    }
  });

  await t.test('5. static checks guard location formatting, live polling, and no default ktm-28 fallback', () => {
    const homepage = readFileSync(new URL('../src/homepage.jsx', import.meta.url), 'utf8');
    const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');

    // formatIncidentLocation must prioritize municipality, ward, and district
    assert.match(homepage, /export function formatIncidentLocation/);
    assert.match(homepage, /\$\{inc\.municipality\} \(Ward \$\{inc\.ward\}\)/);
    assert.match(homepage, /return 'Location Unspecified'/);

    // Live polling mechanism with interval and race condition seqRef
    assert.match(homepage, /setInterval\(\(\) => \{/);
    assert.match(homepage, /loadData\(\{ silent: true \}\)/);
    assert.match(homepage, /const currentSeq = \+\+seqRef\.current/);
    assert.match(homepage, /btn-refresh-feed/);

    // ReportForm in main.jsx must not force areas[0].id for other districts
    assert.match(main, /chosenAreaId = match \? match\.id : ''/);

    // Homepage renders location via formatIncidentLocation
    assert.match(homepage, /formatIncidentLocation\(inc\)/);
    assert.match(homepage, /formatIncidentLocation\(selectedIncident\)/);
  });
});
