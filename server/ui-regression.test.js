import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Static regression checks (no browser needed). They guard the two bugs fixed in this change.
const main = readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');

test('report form never calls reset() on e.currentTarget (null after an await)', () => {
  assert.doesNotMatch(main, /currentTarget\.reset\(\)/);
});

test('report form resets through a guarded ref attached to the <form>', () => {
  assert.match(main, /const formRef = useRef\(null\)/);
  assert.match(main, /<form className="panel" ref=\{formRef\}/);
  assert.match(main, /if \(formRef\.current\) formRef\.current\.reset\(\)/);
});

test('report form reset happens only after the POST resolves', () => {
  const post = main.indexOf("await request('/api/reports', 'POST', body)");
  const reset = main.indexOf('formRef.current.reset()');
  assert.ok(post > -1 && reset > post, 'reset() must come after the awaited request');
});

test('report form blocks duplicate submissions while a request is in flight', () => {
  assert.match(main, /submittingRef\.current \|\| busy/);
});

test('admin report photo is confined to a sized frame', () => {
  assert.match(css, /\.report-photo-frame\s*\{[^}]*aspect-ratio[^}]*overflow:\s*hidden/s);
  assert.match(css, /\.report-photo\s*\{[^}]*width:\s*100%[^}]*object-fit:\s*cover/s);
  assert.match(css, /\.report-details-col\s*\{[^}]*min-width:\s*0/s);
});
