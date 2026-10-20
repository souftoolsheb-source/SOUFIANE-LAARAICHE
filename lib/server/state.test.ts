import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUrlForSsrf, generatePairingCode } from './state';

test('generatePairingCode creates valid 8-char code with hyphen (XXXX-XXXX)', () => {
  const code = generatePairingCode();
  assert.equal(code.length, 9);
  assert.equal(code[4], '-');
  assert.match(code, /^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
});

test('validateUrlForSsrf blocks localhost and loopback IPs', () => {
  const res1 = validateUrlForSsrf('http://localhost:3000/api');
  assert.equal(res1.valid, false);

  const res2 = validateUrlForSsrf('http://127.0.0.1/admin');
  assert.equal(res2.valid, false);

  const res3 = validateUrlForSsrf('http://169.254.169.254/latest/meta-data');
  assert.equal(res3.valid, false);
});

test('validateUrlForSsrf blocks private RFC 1918 subnets', () => {
  const res1 = validateUrlForSsrf('https://10.0.1.5/file.mp4');
  assert.equal(res1.valid, false);

  const res2 = validateUrlForSsrf('https://192.168.1.1/router');
  assert.equal(res2.valid, false);
});

test('validateUrlForSsrf permits safe public URLs', () => {
  const res = validateUrlForSsrf('https://archive.org/details/sample-video.mp4');
  assert.equal(res.valid, true);
  assert.equal(res.hostname, 'archive.org');
});
