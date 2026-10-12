import test from 'node:test';
import assert from 'node:assert/strict';
import { validateReport, transitions } from './validation.js';

const report = { hazard: 'Rising water', area: 'Kathmandu, Ward 28', description: 'Water rising near the road.', photo: 'data:image/png;base64,iVBORw0KGgo=' };
test('accepts a supported photo signature and report fields', () => assert.equal(validateReport(report), null));
test('rejects missing location', () => assert.match(validateReport({ ...report, area: ' ' }), /area/));
test('rejects spoofed photos and unsupported formats', () => {
  assert.match(validateReport({ ...report, photo: 'data:image/png;base64,aGVsbG8=' }), /content/);
  assert.match(validateReport({ ...report, photo: 'data:image/svg+xml;base64,aGVsbG8=' }), /Upload/);
});
test('rejects oversized photos', () => assert.match(validateReport({ ...report, photo: `data:image/png;base64,${Buffer.alloc(3 * 1024 * 1024 + 1).toString('base64')}` }), /3 MB/));
test('lifecycle transitions are explicit and terminal statuses cannot be reopened', () => {
  assert.deepEqual(transitions.Reported, ['Verified', 'Rejected']);
  assert.deepEqual(transitions.Responding, ['Resolved']);
  assert.deepEqual(transitions.Resolved, []);
});
test('rejects malformed incident date and coordinates', () => {
  assert.match(validateReport({ ...report, incidentAt: 'not-a-date' }), /date and time/);
  assert.match(validateReport({ ...report, latitude: 181 }), /coordinates/);
});

test('validates Kathmandu ward selection properly', () => {
  // Valid ward 1 to 32
  assert.equal(validateReport({ ...report, ward: 'Ward 1' }), null);
  assert.equal(validateReport({ ...report, ward: 'Ward 16' }), null);
  assert.equal(validateReport({ ...report, ward: 'Ward 32' }), null);

  // Other requires wardOther
  assert.match(validateReport({ ...report, ward: 'Other' }), /Enter the area name/);
  assert.equal(validateReport({ ...report, ward: 'Other', wardOther: 'Budhanilkantha' }), null);

  // Invalid ward rejected
  assert.match(validateReport({ ...report, ward: 'Ward 33' }), /valid ward/);
  assert.match(validateReport({ ...report, ward: 'InvalidWard' }), /valid ward/);
});

test('rejects far-future incident date', () => {
  const farFuture = new Date(Date.now() + 86400000 * 2).toISOString();
  assert.match(validateReport({ ...report, incidentAt: farFuture }), /future/);
});

test('validates Nepal 7 provinces and 77 districts', () => {
  // Valid province and district pairs across regions
  assert.equal(validateReport({ ...report, province: 'Koshi Province', district: 'Jhapa', municipality: 'Bhadrapur Municipality', ward: 'Ward 1' }), null);
  assert.equal(validateReport({ ...report, province: 'Gandaki Province', district: 'Kaski', municipality: 'Pokhara Metropolitan City', ward: 'Ward 17' }), null);
  assert.equal(validateReport({ ...report, province: 'Karnali Province', district: 'Jumla', municipality: 'Chandannath Municipality', ward: 'Ward 5' }), null);
  assert.equal(validateReport({ ...report, province: 'Sudurpashchim Province', district: 'Kailali', municipality: 'Dhangadhi Sub-Metropolitan City', ward: 'Ward 2' }), null);
  assert.equal(validateReport({ ...report, province: 'Madhesh Province', district: 'Parsa', municipality: 'Birgunj Metropolitan City', ward: 'Ward 10' }), null);
  assert.equal(validateReport({ ...report, province: 'Lumbini Province', district: 'Rupandehi', municipality: 'Butwal Sub-Metropolitan City', ward: 'Ward 3' }), null);

  // Mismatched province and district
  assert.match(validateReport({ ...report, province: 'Koshi Province', district: 'Kathmandu' }), /does not belong to/);
  assert.match(validateReport({ ...report, province: 'Gandaki Province', district: 'Jhapa' }), /does not belong to/);

  // Invalid province
  assert.match(validateReport({ ...report, province: 'Nonexistent Province' }), /valid Nepal province/);

  // Invalid district
  assert.match(validateReport({ ...report, district: 'Nonexistent District' }), /valid Nepal district/);
});

