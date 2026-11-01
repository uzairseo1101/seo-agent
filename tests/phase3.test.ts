import test from 'node:test';
import assert from 'node:assert';
import { discoverSeoOpportunities } from '../lib/gsc/opportunity-engine';
import { calculateChangePct, investigateTrafficDrop } from '../lib/gsc/traffic-drop-engine';
import { generateAuthUrl, validateState } from '../lib/gsc/oauth';
import { GscPerformanceRow } from '../lib/gsc/types';

test('Traffic Drop Math: Correctly handles zero denominators and delta calculations', () => {
  // Test zero denominator
  assert.strictEqual(calculateChangePct(100, 0), 100.0, '0 to 100 should be +100%');
  assert.strictEqual(calculateChangePct(0, 0), 0.0, '0 to 0 should be 0%');
  assert.strictEqual(calculateChangePct(50, 100), -50.0, '100 to 50 should be -50%');
  assert.strictEqual(calculateChangePct(150, 100), 50.0, '100 to 150 should be +50%');
});

test('SEO Opportunity Finder: Detects striking distance and high-impression/low-CTR targets', () => {
  const sampleRows: GscPerformanceRow[] = [
    // Query 1: Striking distance (pos 7.8, imp 14,200)
    {
      date: '2026-10-15',
      page: 'https://example.com/churn',
      query: 'predictive churn modeling software',
      clicks: 340,
      impressions: 14200,
      ctr: 0.0239,
      position: 7.8,
    },
    // Query 2: High Impressions / Low CTR (pos 4.2, imp 28,500, CTR 1.01%)
    {
      date: '2026-10-15',
      page: 'https://example.com/templates',
      query: 'saas metric dashboard templates',
      clicks: 290,
      impressions: 28500,
      ctr: 0.0101,
      position: 4.2,
    },
    // Query 3: Low impression query (should be ignored)
    {
      date: '2026-10-15',
      page: 'https://example.com/faq',
      query: 'obscure small keyword',
      clicks: 1,
      impressions: 20,
      ctr: 0.05,
      position: 12.0,
    },
  ];

  const opps = discoverSeoOpportunities('web-1', sampleRows, { minImpressions: 500 });

  assert.strictEqual(opps.length, 2, 'Should discover exactly 2 opportunities');

  const highImpLowCtr = opps.find(o => o.type === 'high_impressions_low_ctr');
  assert.ok(highImpLowCtr, 'Should detect high_impressions_low_ctr');
  assert.strictEqual(highImpLowCtr?.query, 'saas metric dashboard templates');

  const striking = opps.find(o => o.type === 'striking_distance_5_20');
  assert.ok(striking, 'Should detect striking_distance_5_20');
  assert.strictEqual(striking?.query, 'predictive churn modeling software');
});

test('Traffic Drop Investigator: Computes page-level drops and evidence-backed hypotheses', () => {
  const prevRows: GscPerformanceRow[] = [
    {
      date: '2026-09-10',
      page: 'https://example.com/refills',
      query: 'kitchen refills',
      clicks: 500,
      impressions: 10000,
      ctr: 0.05,
      position: 3.5,
    },
  ];

  const curRows: GscPerformanceRow[] = [
    {
      date: '2026-10-10',
      page: 'https://example.com/refills',
      query: 'kitchen refills',
      clicks: 250,
      impressions: 10200,
      ctr: 0.0245,
      position: 3.6,
    },
  ];

  const comparison = investigateTrafficDrop(
    'web-1',
    curRows,
    prevRows,
    { start: '2026-10-01', end: '2026-10-28' },
    { start: '2026-09-03', end: '2026-09-30' }
  );

  assert.strictEqual(comparison.deltas.clicksChange, -250);
  assert.strictEqual(comparison.deltas.clicksChangePct, -50.0);
  assert.strictEqual(comparison.affectedPages.length, 1);
  assert.strictEqual(comparison.affectedPages[0].clickDrop, 250);
  assert.ok(comparison.affectedPages[0].hypothesis.includes('CTR collapsed'));
});

test('Google OAuth CSRF: Generates valid state token and validates one-time use', () => {
  const { url, state } = generateAuthUrl('org-101', 'http://localhost:3000/api/gsc/callback');
  assert.ok(url.includes(state), 'Auth URL must include state param');

  // First validation must pass
  const firstValidation = validateState(state);
  assert.strictEqual(firstValidation, true, 'State should be valid on first check');

  // Replay attempt must fail (CSRF protection against replay)
  const replayValidation = validateState(state);
  assert.strictEqual(replayValidation, false, 'State should be invalidated after single use');
});
