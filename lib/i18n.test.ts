import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBytes, formatArabicDateTime, formatNumber } from './i18n';

test('formatBytes formats zero and undefined safely', () => {
  assert.equal(formatBytes(0), '0 بايت');
  assert.equal(formatBytes(undefined), '—');
});

test('formatBytes formats megabytes and gigabytes in Arabic', () => {
  const resultMb = formatBytes(1024 * 1024 * 5); // 5 MB
  assert.ok(resultMb.includes('ميجابايت'));

  const resultGb = formatBytes(1024 * 1024 * 1024 * 2.5); // 2.5 GB
  assert.ok(resultGb.includes('جيجابايت'));
});

test('formatNumber formats numbers using Arabic locale', () => {
  const formatted = formatNumber(1500);
  assert.equal(formatted, '1,500');
});

test('formatArabicDateTime handles invalid dates without crashing', () => {
  assert.equal(formatArabicDateTime(undefined), '—');
  assert.equal(formatArabicDateTime('invalid-date'), '—');
  const valid = formatArabicDateTime('2026-10-20T12:00:00Z');
  assert.notEqual(valid, '—');
});
