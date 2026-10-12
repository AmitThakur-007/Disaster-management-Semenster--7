import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, sessionHash } from './auth.js';
import { getWeather, validateAssessment } from './analysis.js';

test('passwords are salted and only correct passwords verify', async () => {
  const first = await hashPassword('a-long-test-password');
  const second = await hashPassword('a-long-test-password');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('a-long-test-password', first), true);
  assert.equal(await verifyPassword('wrong-password', first), false);
  assert.notEqual(sessionHash('first'), sessionHash('second'));
});
test('model responses must have complete structured fields', () => {
  assert.throws(() => validateAssessment({ summary: 'Looks fine.' }), /incomplete/);
  const result = validateAssessment({ summary: 'Reported rising water.', weatherContext: 'Rain forecast.',
    uncertainties: ['Water level is unverified.'], reviewQuestions: ['Is the nearby drain blocked?'], injectedField: true });
  assert.equal(result.injectedField, undefined);
});
test('missing weather does not silently become zero rainfall', async () => {
  await assert.rejects(() => getWeather({ latitude: 27, longitude: 85 }, async () => ({ ok: true, json: async () => ({ daily: { time: ['2026-10-07'] } }) })), /incomplete/);
});
