import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { isAllowedOrigin } from './origin.js';
import { createApp } from './app.js';

test('allows each explicitly configured browser origin', () => {
  const configured = 'http://127.0.0.1:3001,http://localhost:3001';
  assert.equal(isAllowedOrigin('http://127.0.0.1:3001', configured), true);
  assert.equal(isAllowedOrigin('http://localhost:3001', configured), true);
});

test('rejects unconfigured and malformed origins', () => {
  assert.equal(isAllowedOrigin('http://localhost:3001', 'http://127.0.0.1:3001'), false);
  assert.equal(isAllowedOrigin('https://attacker.example', 'http://localhost:3001'), false);
  assert.equal(isAllowedOrigin('not an origin', 'not a configured origin'), false);
});

test('normalizes a valid configured URL and allows requests without Origin', () => {
  assert.equal(isAllowedOrigin('http://localhost:3001', 'http://localhost:3001/'), true);
  assert.equal(isAllowedOrigin(undefined, 'http://localhost:3001'), true);
});

test('the API explains why a disallowed login origin receives 403', async () => {
  const server = createApp({}).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
      method: 'POST', headers: { Origin: 'https://attacker.example', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'resident@example.test', password: 'not-a-real-password' }),
    });
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: 'Request origin is not allowed.' });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
