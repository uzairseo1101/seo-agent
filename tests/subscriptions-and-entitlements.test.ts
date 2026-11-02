import test from 'node:test';
import assert from 'node:assert';
import { PRICING_CONFIG, PLAN_LIMITS_MAP, PlanId } from '../lib/pricing-config';
import { getPlanLimits, validateEntitlement } from '../lib/entitlements';

test('Subscriptions & Entitlements Engine Verification', async (t) => {
  await t.test('Pricing Matrix & Annual Savings Calculation', () => {
    // 4 Plans defined
    assert.strictEqual(PRICING_CONFIG.tiers.length, 4);

    const free = PRICING_CONFIG.tiers.find(t => t.id === 'free')!;
    const freelancer = PRICING_CONFIG.tiers.find(t => t.id === 'freelancer')!;
    const agency = PRICING_CONFIG.tiers.find(t => t.id === 'agency')!;
    const team = PRICING_CONFIG.tiers.find(t => t.id === 'team')!;

    // Free plan is $0
    assert.strictEqual(free.monthlyPrice, 0);
    assert.strictEqual(free.annualPrice, 0);

    // Freelancer: $39/mo or $390/yr -> Saves $78/yr
    assert.strictEqual(freelancer.monthlyPrice, 39);
    assert.strictEqual(freelancer.annualPrice, 390);
    assert.strictEqual(freelancer.annualSavings, 78);
    assert.strictEqual((freelancer.monthlyPrice * 12) - freelancer.annualPrice, 78);

    // Agency: $99/mo or $990/yr -> Saves $198/yr
    assert.strictEqual(agency.monthlyPrice, 99);
    assert.strictEqual(agency.annualPrice, 990);
    assert.strictEqual(agency.annualSavings, 198);
    assert.strictEqual((agency.monthlyPrice * 12) - agency.annualPrice, 198);

    // Team: $149/mo or $1,490/yr -> Saves $298/yr
    assert.strictEqual(team.monthlyPrice, 149);
    assert.strictEqual(team.annualPrice, 1490);
    assert.strictEqual(team.annualSavings, 298);
    assert.strictEqual((team.monthlyPrice * 12) - team.annualPrice, 298);
  });

  await t.test('Entitlement Limits Map conforms to Master Product Specification', () => {
    // Free
    assert.strictEqual(PLAN_LIMITS_MAP.free.maxWebsites, 1);
    assert.strictEqual(PLAN_LIMITS_MAP.free.maxCrawledPages, 10);
    assert.strictEqual(PLAN_LIMITS_MAP.free.maxSavedReports, 3);
    assert.strictEqual(PLAN_LIMITS_MAP.free.hasGscSync, false);
    assert.strictEqual(PLAN_LIMITS_MAP.free.hasStrikingDistance, false);
    assert.strictEqual(PLAN_LIMITS_MAP.free.hasTrafficDropEngine, false);

    // Freelancer
    assert.strictEqual(PLAN_LIMITS_MAP.freelancer.maxWebsites, 3);
    assert.strictEqual(PLAN_LIMITS_MAP.freelancer.maxCrawledPages, 25);
    assert.strictEqual(PLAN_LIMITS_MAP.freelancer.historyRetentionDays, 90);
    assert.strictEqual(PLAN_LIMITS_MAP.freelancer.hasGscSync, true);
    assert.strictEqual(PLAN_LIMITS_MAP.freelancer.hasStrikingDistance, false);

    // Agency
    assert.strictEqual(PLAN_LIMITS_MAP.agency.maxWebsites, 15);
    assert.strictEqual(PLAN_LIMITS_MAP.agency.maxCrawledPages, 100);
    assert.strictEqual(PLAN_LIMITS_MAP.agency.historyRetentionDays, 365);
    assert.strictEqual(PLAN_LIMITS_MAP.agency.hasStrikingDistance, true);
    assert.strictEqual(PLAN_LIMITS_MAP.agency.hasTrafficDropEngine, true);
    assert.strictEqual(PLAN_LIMITS_MAP.agency.hasWhiteLabelReports, true);

    // Team
    assert.strictEqual(PLAN_LIMITS_MAP.team.maxWebsites, 50);
    assert.strictEqual(PLAN_LIMITS_MAP.team.maxCrawledPages, 500);
    assert.strictEqual(PLAN_LIMITS_MAP.team.hasKeywordClustering, true);
    assert.strictEqual(PLAN_LIMITS_MAP.team.hasApiAccess, true);
  });

  await t.test('validateEntitlement correctly evaluates crawl limits', async () => {
    // For free tier (default fallback when org is null)
    const validCrawl = await validateEntitlement(null, 'crawled_pages', 8);
    assert.strictEqual(validCrawl.allowed, true);

    const exceedCrawl = await validateEntitlement(null, 'crawled_pages', 25);
    assert.strictEqual(exceedCrawl.allowed, false);
    assert.ok(exceedCrawl.upgradePrompt?.includes('Freelancer'));
  });

  await t.test('validateEntitlement correctly blocks gated features on Free plan', async () => {
    const gscCheck = await validateEntitlement(null, 'gsc_sync');
    assert.strictEqual(gscCheck.allowed, false);

    const strikingCheck = await validateEntitlement(null, 'striking_distance');
    assert.strictEqual(strikingCheck.allowed, false);

    const trafficDropCheck = await validateEntitlement(null, 'traffic_drop');
    assert.strictEqual(trafficDropCheck.allowed, false);
  });
});
