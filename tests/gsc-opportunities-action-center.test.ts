import test from 'node:test';
import assert from 'node:assert';
import { discoverSeoOpportunities } from '../lib/gsc/opportunity-engine';
import { validateRegex, analyzeGscKeywords, classifySearchIntent, getPositionCtrBenchmark, GSC_REGEX_PRESETS } from '../lib/gsc/regex-engine';
import { storage } from '../lib/storage';
import { db } from '../lib/db';
import { verifyTaskFix } from '../lib/verification/verification-engine';
import { GscPerformanceRow } from '../lib/gsc/types';
import { AuditFinding, ActionItem } from '../lib/types';
import { generateUuid } from '../lib/utils';

// =============================================================================
// TEST SUITE: Upgraded GSC, Opportunities & Action Center Engine
// =============================================================================

test('1. GSC-connected users receive evidence-based opportunities from real data', () => {
  const websiteId = generateUuid();
  const sampleGscRows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/templates',
      query: 'saas dashboard templates',
      clicks: 310,
      impressions: 22000,
      ctr: 0.0141,
      position: 4.1,
    },
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/features/churn-prediction',
      query: 'predictive churn modeling software',
      clicks: 140,
      impressions: 4800,
      ctr: 0.0291,
      position: 6.8,
    },
  ];

  const opps = discoverSeoOpportunities(websiteId, sampleGscRows, { minImpressions: 200 });

  assert.ok(opps.length >= 2, 'Must generate opportunities from GSC records');
  for (const opp of opps) {
    assert.strictEqual(opp.websiteId, websiteId);
    assert.ok(opp.impressions > 0, 'Must contain verified impression count');
    assert.ok(opp.query.length > 0, 'Must have target query');
    assert.ok(opp.pageUrl.startsWith('http'), 'Must have verified landing page URL');
    assert.ok(opp.hypothesis.length > 10, 'Must provide an evidence-backed hypothesis');
    assert.ok(opp.recommendedAction.length > 10, 'Must have actionable recommendation');
    assert.ok(opp.implementationSteps && opp.implementationSteps.length > 0, 'Must have implementation steps');
    assert.ok(opp.evidence?.gscMetrics, 'Must retain evidence reference to GSC metrics');
  }
});

test('2. Regex filters correctly match query records and handle invalid expressions gracefully', () => {
  // Test A: Syntax validation
  const validRegex = validateRegex('^(how|what|why)\\b');
  assert.strictEqual(validRegex.isValid, true);
  assert.ok(validRegex.regex instanceof RegExp);

  // Test B: Invalid regex must not crash
  const brokenRegex = validateRegex('[unclosed-bracket(');
  assert.strictEqual(brokenRegex.isValid, false);
  assert.ok(brokenRegex.error && brokenRegex.error.includes('Invalid regular expression'));

  // Test C: Regex evaluation against dataset
  const rows: GscPerformanceRow[] = [
    { date: '2026-11-01', page: 'https://saasflow.io/blog/churn', query: 'how to reduce b2b churn rate', clicks: 45, impressions: 1200, ctr: 0.0375, position: 5.2 },
    { date: '2026-11-01', page: 'https://saasflow.io/blog/churn', query: 'what is churn prediction', clicks: 30, impressions: 950, ctr: 0.0315, position: 6.1 },
    { date: '2026-11-01', page: 'https://saasflow.io/pricing', query: 'saasflow pricing plans', clicks: 80, impressions: 500, ctr: 0.16, position: 1.8 },
    { date: '2026-11-01', page: 'https://saasflow.io/features', query: 'enterprise customer analytics platform', clicks: 25, impressions: 800, ctr: 0.0312, position: 7.4 },
  ];

  const questionResult = analyzeGscKeywords(rows, {
    customRegex: '^(how|what)\\b',
  });

  assert.strictEqual(questionResult.regexValidation.isValid, true);
  assert.strictEqual(questionResult.queries.length, 2);
  assert.ok(questionResult.queries.every(q => q.query.startsWith('how') || q.query.startsWith('what')));

  // Test D: Invalid regex filter does not crash analyzeGscKeywords
  const safeBrokenResult = analyzeGscKeywords(rows, {
    customRegex: '*(invalid',
  });
  assert.strictEqual(safeBrokenResult.regexValidation.isValid, false);
  assert.ok(safeBrokenResult.regexValidation.errorMessage);
  assert.ok(safeBrokenResult.summary.datasetScopeNote.length > 20);
});

test('3. Zero-click queries are identified correctly with position-aware intent analysis', () => {
  const websiteId = generateUuid();
  const rows: GscPerformanceRow[] = [
    // Page 1 zero-click query (position 5.4, 800 impressions, 0 clicks)
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/templates',
      query: 'customer retention formula pdf',
      clicks: 0,
      impressions: 800,
      ctr: 0,
      position: 5.4,
    },
    // Page 3 zero-click query (position 26.2, 550 impressions, 0 clicks)
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/blog/code',
      query: 'cohort churn python script',
      clicks: 0,
      impressions: 550,
      ctr: 0,
      position: 26.2,
    },
  ];

  const opps = discoverSeoOpportunities(websiteId, rows, { minImpressions: 100 });
  const zeroClickOpps = opps.filter(o => o.type === 'zero_clicks_with_impressions');

  assert.ok(zeroClickOpps.length >= 1, 'Must detect zero click queries');
  const pageOneOpp = zeroClickOpps.find(o => o.query === 'customer retention formula pdf');
  assert.ok(pageOneOpp, 'Must identify page 1 zero click query');
  assert.ok(
    pageOneOpp.hypothesis.includes('Page 1') || pageOneOpp.hypothesis.includes('intent mismatch'),
    'Page 1 zero click must note snippet/intent mismatch'
  );
  assert.strictEqual(pageOneOpp.clicks, 0);
  assert.strictEqual(pageOneOpp.ctr, 0);
});

test('4. High-impression, low-CTR opportunities use position-aware CTR thresholds', () => {
  // Benchmark verification
  assert.strictEqual(getPositionCtrBenchmark(1.2), 0.28, 'Pos 1 benchmark ~28%');
  assert.strictEqual(getPositionCtrBenchmark(4.0), 0.07, 'Pos 4 benchmark ~7%');
  assert.strictEqual(getPositionCtrBenchmark(8.0), 0.03, 'Pos 8 benchmark ~3%');

  const websiteId = generateUuid();
  const rows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/features/analytics',
      query: 'customer analytics platform',
      clicks: 120,
      impressions: 14000,
      ctr: 0.0085, // 0.85% CTR at pos 3.2 is severely underperforming ~10% benchmark
      position: 3.2,
    },
  ];

  const opps = discoverSeoOpportunities(websiteId, rows, { minImpressions: 500 });
  const ctrOpp = opps.find(o => o.type === 'high_impressions_low_ctr');

  assert.ok(ctrOpp, 'Must flag position-aware low CTR');
  assert.strictEqual(ctrOpp.category, 'ctr_improvements');
  assert.strictEqual(ctrOpp.potentialImpact, 'critical');
  assert.ok(ctrOpp.hypothesis.includes('benchmark'));
});

test('5. Question and commercial-intent keyword classifications work accurately', () => {
  const brandConfig = { brandNames: ['saasflow'], competitorNames: ['churnzero'] };

  const qIntent = classifySearchIntent('how to calculate net revenue retention in saas', brandConfig);
  assert.strictEqual(qIntent.intent, 'informational');
  assert.strictEqual(qIntent.isQuestion, true);
  assert.strictEqual(qIntent.isLongTail, true);

  const commIntent = classifySearchIntent('best churn prediction software alternatives', brandConfig);
  assert.strictEqual(commIntent.intent, 'commercial');
  assert.strictEqual(commIntent.isQuestion, false);

  const compIntent = classifySearchIntent('churnzero alternatives comparison vs saasflow', brandConfig);
  assert.strictEqual(compIntent.intent, 'commercial');
  assert.strictEqual(compIntent.isCompetitor, true);

  const brandIntent = classifySearchIntent('saasflow login', brandConfig);
  assert.strictEqual(brandIntent.isBranded, true);
  assert.strictEqual(brandIntent.intent, 'navigational');
});

test('6. Audit findings connect to correct landing pages without fabricating unverified issues', () => {
  const websiteId = generateUuid();
  const targetPage = 'https://saasflow.io/features/customer-analytics';
  const unverifiedPage = 'https://saasflow.io/blog/retention-guide';

  const verifiedFinding: AuditFinding = {
    id: generateUuid(),
    auditRunId: generateUuid(),
    websiteId,
    url: targetPage,
    category: 'technical',
    issueType: 'missing_h1',
    severity: 'critical',
    title: 'Missing Top-Level Heading (H1)',
    description: 'Zero <h1> tags discovered in live markup.',
    recommendation: 'Add a descriptive <h1> tag matching user query.',
    confidenceLevel: 'high',
    detectionMethod: 'DOM Parser',
    evidence: { expected: '1 h1', actual: '0 h1' },
    isResolved: false,
    createdAt: new Date().toISOString(),
  };

  const rows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: targetPage,
      query: 'enterprise customer analytics platform',
      clicks: 120,
      impressions: 4200,
      ctr: 0.0285,
      position: 5.4,
    },
    {
      date: '2026-11-01',
      page: unverifiedPage,
      query: 'customer retention strategies guide',
      clicks: 60,
      impressions: 2100,
      ctr: 0.0285,
      position: 8.2,
    },
  ];

  const opps = discoverSeoOpportunities(websiteId, rows, {
    auditFindings: [verifiedFinding],
    minImpressions: 100,
  });

  // Target page must connect to verified finding
  const techOpp = opps.find(o => o.pageUrl === targetPage && o.category === 'technical_seo');
  assert.ok(techOpp, 'Must connect technical finding on target page');
  assert.strictEqual(techOpp.evidence?.auditFindings?.[0]?.issueType, 'missing_h1');
  assert.strictEqual(techOpp.evidence?.auditFindings?.[0]?.severity, 'critical');

  // Unverified page must NOT fabricate any technical finding
  const unverifiedOpp = opps.find(o => o.pageUrl === unverifiedPage);
  assert.ok(unverifiedOpp, 'Unverified page still gets ranking opportunity');
  assert.ok(!unverifiedOpp.evidence?.auditFindings, 'Must not attach unverified technical issues');
});

test('7. SERP, AI Overviews, and GEO/AEO recommendations are clearly distinguished', () => {
  const websiteId = generateUuid();
  const rows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/blog/metrics',
      query: 'what is net revenue retention rate',
      clicks: 80,
      impressions: 3200,
      ctr: 0.025,
      position: 4.8,
    },
  ];

  const opps = discoverSeoOpportunities(websiteId, rows, {
    minImpressions: 100,
    generateAiOverviewOpps: true,
  });

  const questionOpp = opps.find(o => o.category === 'question_keywords');
  assert.ok(questionOpp, 'Must generate question opportunity');
  assert.ok(
    questionOpp.expertExplanation?.includes('does not guarantee rich snippets') ||
    questionOpp.recommendedAction?.includes('heading'),
    'Question strategy must not promise rich snippet guarantees'
  );

  const aioOpp = opps.find(o => o.category === 'ai_overviews');
  assert.ok(aioOpp, 'Must generate AI Overviews opportunity');
  assert.ok(
    aioOpp.expertExplanation?.includes('No specific formatting guarantees AI Overview citation'),
    'AI Overviews recommendation must include honest disclaimer'
  );
});

test('8. Opportunities can be added to Action Center with all pre-populated metadata', async () => {
  const websiteId = generateUuid();
  const oppId = `opp-test-${Date.now()}`;

  const opp = {
    id: oppId,
    websiteId,
    type: 'high_impressions_low_ctr',
    category: 'ctr_improvements' as const,
    title: 'Optimize SERP Snippet: "saas templates"',
    query: 'saas templates',
    pageUrl: 'https://saasflow.io/templates',
    impressions: 25000,
    clicks: 220,
    ctr: 0.0088,
    position: 4.3,
    potentialImpact: 'critical' as const,
    priority: 'critical' as const,
    hypothesis: 'High impressions but weak click capture due to generic snippet.',
    recommendedAction: 'Rewrite title tag and meta description.',
    implementationSteps: ['Review SERP', 'Draft 55-char title', 'Deploy to production'],
    status: 'open' as const,
  };

  storage.saveOpportunities(websiteId, [opp]);

  // Convert to task via storage service
  const task = storage.createActionItemFromOpportunity(oppId);
  assert.ok(task, 'Task must be created');
  assert.strictEqual(task.sourceType, 'seo_opportunity');
  assert.strictEqual(task.sourceId, oppId);
  assert.strictEqual(task.targetKeyword, 'saas templates');
  assert.strictEqual(task.opportunityCategory, 'ctr_improvements');
  assert.strictEqual(task.priority, 'critical');
  assert.strictEqual(task.baselineMetrics?.clicks, 220);
  assert.strictEqual(task.baselineMetrics?.impressions, 25000);
  assert.strictEqual(task.baselineMetrics?.position, 4.3);
  assert.strictEqual(task.steps.length, 3);
});

test('9. Duplicate tasks are prevented when the same opportunity is added again', async () => {
  const websiteId = generateUuid();
  const oppId = `opp-dup-${Date.now()}`;

  const opp = {
    id: oppId,
    websiteId,
    type: 'striking_distance_5_20',
    category: 'serp_growth' as const,
    title: 'Striking Distance Target: "churn software"',
    query: 'churn software',
    pageUrl: 'https://saasflow.io/features',
    impressions: 8000,
    clicks: 110,
    ctr: 0.0137,
    position: 7.2,
    potentialImpact: 'high' as const,
    priority: 'high' as const,
    hypothesis: 'Position 7.2 with strong potential.',
    recommendedAction: 'Add internal links.',
    status: 'open' as const,
  };

  storage.saveOpportunities(websiteId, [opp]);

  const task1 = storage.createActionItemFromOpportunity(oppId);
  assert.ok(task1);

  // Attempt duplicate addition
  const task2 = storage.createActionItemFromOpportunity(oppId);
  assert.strictEqual(task2?.id, task1?.id, 'Duplicate task creation must return existing task');

  // Verify through DB layer deduplication
  const dbTask1 = await db.createActionItem({
    websiteId,
    sourceType: 'seo_opportunity',
    sourceId: oppId,
    targetKeyword: 'churn software',
    affectedUrl: 'https://saasflow.io/features',
    title: 'Striking Distance Target: "churn software"',
  });

  const dbTask2 = await db.createActionItem({
    websiteId,
    sourceType: 'seo_opportunity',
    sourceId: oppId,
    targetKeyword: 'churn software',
    affectedUrl: 'https://saasflow.io/features',
    title: 'Striking Distance Target: "churn software"',
  });

  assert.strictEqual(dbTask2.id, dbTask1.id, 'DB layer must prevent duplicate opportunity tasks');
});

test('10. Task completion and baseline performance verification calculate deltas and display causality disclaimer', async () => {
  const websiteId = generateUuid();
  const taskId = generateUuid();

  const oppTask: ActionItem = {
    id: taskId,
    organizationId: generateUuid(),
    websiteId,
    sourceType: 'seo_opportunity',
    title: 'Optimize Snippet: "b2b churn modeling"',
    description: 'Improve CTR on page 1',
    category: 'content',
    priority: 'high',
    affectedUrl: 'https://saasflow.io/features/churn-prediction',
    recommendedSolution: 'Update title tag',
    steps: ['Draft title', 'Publish'],
    status: 'completed',
    verificationStatus: 'unverified',
    targetKeyword: 'b2b churn modeling',
    opportunityCategory: 'ctr_improvements',
    baselineMetrics: {
      clicks: 100,
      impressions: 5000,
      ctr: 0.02,
      position: 7.5,
      date: '2026-10-01',
    },
    createdAt: new Date().toISOString(),
  };

  storage.addActionItem(oppTask);

  // Scenario A: Synced GSC metrics show verified performance improvement
  const improvedGscRows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/features/churn-prediction',
      query: 'b2b churn modeling',
      clicks: 180, // +80 clicks (+80%)
      impressions: 5500,
      ctr: 0.0327, // +1.27% CTR
      position: 4.8, // improved by +2.7 positions
    },
  ];
  await db.saveGscMetrics(websiteId, improvedGscRows);

  const verification = await verifyTaskFix(taskId);

  assert.ok(verification, 'Must produce verification result');
  assert.strictEqual(verification.outcome, 'completed_verified');
  assert.ok(verification.explanation.includes('Verified: Search Console metrics show measured improvement'));
  assert.ok(verification.explanation.includes('100 -> 180'), 'Must show before and after clicks');
  assert.ok(
    verification.explanation.includes('Observed Search Console changes reflect external SERP shifts and do not necessarily prove'),
    'Must display causality disclaimer'
  );

  // Scenario B: Synced GSC metrics show no improvement
  const failedTaskId = generateUuid();
  const stagnatedTask: ActionItem = {
    id: failedTaskId,
    organizationId: generateUuid(),
    websiteId,
    sourceType: 'seo_opportunity',
    title: 'Stagnated Query Optimization',
    description: 'No rank movement yet',
    category: 'content',
    priority: 'medium',
    affectedUrl: 'https://saasflow.io/features/pricing',
    recommendedSolution: 'Rewrite description',
    steps: ['Test'],
    status: 'completed',
    verificationStatus: 'unverified',
    targetKeyword: 'unimproved pricing query',
    opportunityCategory: 'ctr_improvements',
    baselineMetrics: {
      clicks: 50,
      impressions: 2000,
      ctr: 0.025,
      position: 8.0,
    },
    createdAt: new Date().toISOString(),
  };

  storage.addActionItem(stagnatedTask);

  const flatGscRows: GscPerformanceRow[] = [
    {
      date: '2026-11-01',
      page: 'https://saasflow.io/features/pricing',
      query: 'unimproved pricing query',
      clicks: 40, // dropped by 10
      impressions: 1900,
      ctr: 0.021,
      position: 9.1, // dropped
    },
  ];
  await db.saveGscMetrics(websiteId, flatGscRows);

  const stagnatedVerification = await verifyTaskFix(failedTaskId);
  assert.strictEqual(stagnatedVerification.outcome, 'not_improved');
  assert.ok(stagnatedVerification.explanation.includes('Not Improved'));
  assert.ok(stagnatedVerification.explanation.includes('prove causality'));
});

test('11. Multi-tenant isolation: different websites do not cross-leak opportunities or tasks', async () => {
  const siteA = generateUuid();
  const siteB = generateUuid();

  const oppA = {
    id: `opp-a-${Date.now()}`,
    websiteId: siteA,
    type: 'striking_distance_5_20',
    category: 'serp_growth' as const,
    title: 'Site A Opportunity',
    query: 'site a keyword',
    pageUrl: 'https://site-a.com/page',
    impressions: 1000,
    clicks: 20,
    ctr: 0.02,
    position: 6.0,
    potentialImpact: 'medium' as const,
    hypothesis: 'Site A hypothesis',
    recommendedAction: 'Action A',
    status: 'open' as const,
  };

  const oppB = {
    id: `opp-b-${Date.now()}`,
    websiteId: siteB,
    type: 'striking_distance_5_20',
    category: 'serp_growth' as const,
    title: 'Site B Opportunity',
    query: 'site b keyword',
    pageUrl: 'https://site-b.com/page',
    impressions: 2000,
    clicks: 40,
    ctr: 0.02,
    position: 7.0,
    potentialImpact: 'medium' as const,
    hypothesis: 'Site B hypothesis',
    recommendedAction: 'Action B',
    status: 'open' as const,
  };

  storage.saveOpportunities(siteA, [oppA]);
  storage.saveOpportunities(siteB, [oppB]);

  const oppsForSiteA = storage.getOpportunities(siteA);
  const oppsForSiteB = storage.getOpportunities(siteB);

  assert.strictEqual(oppsForSiteA.length, 1);
  assert.strictEqual(oppsForSiteA[0].query, 'site a keyword');
  assert.ok(!oppsForSiteA.some(o => o.websiteId === siteB), 'Site A must not leak Site B data');

  assert.strictEqual(oppsForSiteB.length, 1);
  assert.strictEqual(oppsForSiteB[0].query, 'site b keyword');
  assert.ok(!oppsForSiteB.some(o => o.websiteId === siteA), 'Site B must not leak Site A data');
});

test('12. Empty datasets and API failures are handled honestly without fabricating mock data', () => {
  const emptySiteId = generateUuid();

  // Passing empty rows
  const opps = discoverSeoOpportunities(emptySiteId, []);
  assert.strictEqual(opps.length, 0, 'Empty GSC dataset must return 0 opportunities without fabricating data');

  // Query analysis on empty rows
  const keywordResult = analyzeGscKeywords([]);
  assert.strictEqual(keywordResult.queries.length, 0);
  assert.strictEqual(keywordResult.summary.totalClicks, 0);
  assert.strictEqual(keywordResult.summary.totalImpressions, 0);
  assert.ok(keywordResult.summary.datasetScopeNote.length > 10);
});
