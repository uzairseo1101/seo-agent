import test from 'node:test';
import assert from 'node:assert';
import { storage } from '../lib/storage';
import { db } from '../lib/db';
import { crawlWebsite, normalizeUrl, isDisallowedByRobots } from '../lib/crawler/crawler';
import { validateUrlForSsrf } from '../lib/crawler/ssrf-guard';
import { analyzeTechnicalSeo } from '../lib/analyzer/technical-seo';
import { analyzeGeoSignals } from '../lib/analyzer/geo-analyzer';
import { analyzeAeoSignals } from '../lib/analyzer/aeo-analyzer';
import { calculateAuditScores } from '../lib/analyzer/scoring';
import { executeWebsiteAudit } from '../lib/analyzer/audit-engine';
import { verifyTaskFix } from '../lib/verification/verification-engine';
import { generateClientReportDataAsync } from '../lib/reports/report-generator';
import { generateUuid, isValidUuid } from '../lib/utils';
import { AuditFinding, CrawledPageData, CrawlResult } from '../lib/types';

test('Audit & Crawl Engine: Master Verification Test Suite', async (t) => {
  // =========================================================================
  // TEST 1: Critical Bug Fix — Real UUID Generation & Retrieval
  // =========================================================================
  await t.test('1. Website creation and retrieval uses RFC 4122 UUIDs without web-* legacy strings', () => {
    const site = storage.addWebsite({
      name: 'TechFlow SaaS',
      domain: 'techflow-saas-test.io',
      url: 'https://techflow-saas-test.io',
    });

    assert.ok(site.id, 'Website must have an ID');
    assert.ok(isValidUuid(site.id), `Website ID "${site.id}" must be a valid RFC 4122 UUID`);
    assert.ok(!site.id.startsWith('web-'), 'Website ID must not use legacy string-prefixed timestamps');

    const retrieved = storage.getWebsiteById(site.id);
    assert.strictEqual(retrieved?.id, site.id, 'Website must be retrievable by UUID');
    assert.strictEqual(retrieved?.domain, 'techflow-saas-test.io');
  });

  // =========================================================================
  // TEST 2: URL Normalization & Robots.txt Logic
  // =========================================================================
  await t.test('2. URL normalization strips fragments and tracking parameters cleanly', () => {
    const raw1 = 'https://Example.COM/services/?utm_source=google&utm_medium=cpc#section-2';
    const normalized1 = normalizeUrl(raw1);
    assert.strictEqual(normalized1, 'https://example.com/services');

    const raw2 = 'https://example.com/blog//';
    const normalized2 = normalizeUrl(raw2);
    assert.strictEqual(normalized2, 'https://example.com/blog');

    // Robots.txt disallow check
    const rules = ['/admin', '/private/', '/checkout'];
    assert.strictEqual(isDisallowedByRobots('https://example.com/admin/settings', rules), true);
    assert.strictEqual(isDisallowedByRobots('https://example.com/private/user', rules), true);
    assert.strictEqual(isDisallowedByRobots('https://example.com/blog/post-1', rules), false);
  });

  // =========================================================================
  // TEST 3: SSRF Boundary Defense
  // =========================================================================
  await t.test('3. Anti-SSRF Guard blocks private networks and cloud metadata', async () => {
    const loopback = await validateUrlForSsrf('http://127.0.0.1:8080/admin');
    assert.strictEqual(loopback.isValid, false, 'Must block 127.0.0.1');

    const privateA = await validateUrlForSsrf('http://10.0.0.5/');
    assert.strictEqual(privateA.isValid, false, 'Must block 10.0.0.0/8 private class A');

    const awsMetadata = await validateUrlForSsrf('http://169.254.169.254/latest/meta-data/');
    assert.strictEqual(awsMetadata.isValid, false, 'Must block cloud metadata 169.254.169.254');

    const nonStandardPort = await validateUrlForSsrf('http://example.com:8443/api');
    assert.strictEqual(nonStandardPort.isValid, false, 'Must block non-standard port 8443');
  });

  // =========================================================================
  // TEST 4: Deterministic Technical SEO Rules
  // =========================================================================
  await t.test('4. Technical SEO Engine detects missing title, H1, meta description, and canonical', () => {
    const mockAuditRunId = generateUuid();
    const mockWebsiteId = generateUuid();

    // Fixture page with multiple defects
    const defectivePage: CrawledPageData = {
      url: 'https://example.com/defective',
      finalUrl: 'https://example.com/defective',
      redirectHops: [],
      redirectCount: 0,
      isRedirectChain: false,
      isRedirectLoop: false,
      statusCode: 200,
      loadTimeMs: 450,
      contentType: 'text/html',
      title: '', // Missing title
      metaDescription: '', // Missing meta description
      canonicalUrl: undefined, // Missing canonical
      metaRobots: undefined,
      xRobotsTag: undefined,
      h1Elements: [], // Missing H1
      h2Elements: ['Section Subheading'],
      h3Elements: ['Subsection'],
      h4Elements: [],
      h5Elements: [],
      h6Elements: [],
      mainContent: 'Short test content for evaluation.',
      wordCount: 15,
      internalLinks: [],
      externalLinks: [],
      images: [{ src: '/hero.png', isMissingAlt: true }],
      schemas: [],
      hasMobileViewport: false, // Missing viewport
      lang: undefined, // Missing lang
      openGraph: {},
      twitterCard: {},
      isClientSideRendered: false,
      isIndexable: true,
      isRobotsAllowed: true,
      rawHtmlSnippet: '<html><head></head><body><h2>Section</h2><img src="/hero.png"/></body></html>',
    };

    const mockCrawlResult: CrawlResult = {
      pages: [defectivePage],
      discoveredUrls: [defectivePage.url],
      crawledUrls: [defectivePage.url],
      skippedUrls: [],
      failedUrls: [],
      robotsTxt: { accessible: true, statusCode: 200, disallowRules: [], sitemaps: [] },
      sitemap: { accessible: true, urlCount: 1, sitemapsFound: [] },
      durationMs: 400,
      errors: [],
      coverage: {
        discovered: 1,
        crawled: 1,
        skipped: 0,
        failed: 0,
        remaining: 0,
        maxAllowedPages: 10,
        limitReached: false,
      },
    };

    const findings = analyzeTechnicalSeo(mockCrawlResult, mockWebsiteId, mockAuditRunId, 'https://example.com');

    const issueTypes = findings.map(f => f.issueType);
    assert.ok(issueTypes.includes('missing_title'), 'Must detect missing title');
    assert.ok(issueTypes.includes('missing_meta_description'), 'Must detect missing meta description');
    assert.ok(issueTypes.includes('missing_h1'), 'Must detect missing H1');
    assert.ok(issueTypes.includes('missing_canonical'), 'Must detect missing canonical');
    assert.ok(issueTypes.includes('missing_mobile_viewport'), 'Must detect missing mobile viewport');
    assert.ok(issueTypes.includes('missing_image_alt'), 'Must detect missing image alt');
    assert.ok(issueTypes.includes('missing_html_lang'), 'Must detect missing lang');

    // Verify finding data structure
    const titleFinding = findings.find(f => f.issueType === 'missing_title')!;
    assert.strictEqual(titleFinding.severity, 'critical');
    assert.strictEqual(titleFinding.findingType, 'confirmed_error');
    assert.ok(titleFinding.whyItMatters, 'Must contain whyItMatters explanation');
    assert.ok(Array.isArray(titleFinding.implementationSteps), 'Must contain implementationSteps array');
    assert.ok(titleFinding.verificationCriteria, 'Must contain verificationCriteria');
    assert.ok(titleFinding.evidence.expected, 'Must contain expected evidence');
    assert.ok(titleFinding.evidence.actual, 'Must contain actual evidence');
  });

  // =========================================================================
  // TEST 5: Multiple H1 Review Signal vs Critical Classification
  // =========================================================================
  await t.test('5. Multiple H1s is classified as notice/informational review signal, not critical error', () => {
    const pageWithMultipleH1: CrawledPageData = {
      url: 'https://example.com/multi-h1',
      finalUrl: 'https://example.com/multi-h1',
      redirectHops: [],
      redirectCount: 0,
      isRedirectChain: false,
      isRedirectLoop: false,
      statusCode: 200,
      loadTimeMs: 200,
      contentType: 'text/html',
      title: 'Valid Optimized Title Here',
      metaDescription: 'Valid optimized meta description that covers topic nicely and clearly.',
      canonicalUrl: 'https://example.com/multi-h1',
      h1Elements: ['First Primary Headline', 'Second Competing Headline'],
      h2Elements: ['Subsection A'],
      h3Elements: [],
      h4Elements: [],
      h5Elements: [],
      h6Elements: [],
      mainContent: 'Body content with multiple headings.',
      wordCount: 250,
      internalLinks: [],
      externalLinks: [],
      images: [],
      schemas: [],
      hasMobileViewport: true,
      lang: 'en',
      openGraph: { title: 'T', description: 'D' },
      twitterCard: {},
      isClientSideRendered: false,
      isIndexable: true,
      isRobotsAllowed: true,
      rawHtmlSnippet: '',
    };

    const crawlResult: CrawlResult = {
      pages: [pageWithMultipleH1],
      discoveredUrls: [pageWithMultipleH1.url],
      crawledUrls: [pageWithMultipleH1.url],
      skippedUrls: [],
      failedUrls: [],
      robotsTxt: { accessible: true, statusCode: 200, disallowRules: [], sitemaps: [] },
      sitemap: { accessible: true, urlCount: 1, sitemapsFound: [] },
      durationMs: 200,
      errors: [],
      coverage: {
        discovered: 1,
        crawled: 1,
        skipped: 0,
        failed: 0,
        remaining: 0,
        maxAllowedPages: 10,
        limitReached: false,
      },
    };

    const findings = analyzeTechnicalSeo(crawlResult, generateUuid(), generateUuid(), 'https://example.com');
    const multiH1 = findings.find(f => f.issueType === 'multiple_h1_review_signal');
    assert.ok(multiH1, 'Must detect multiple H1 review signal');
    assert.strictEqual(multiH1.severity, 'notice', 'Multiple H1s must be severity notice, not critical');
    assert.strictEqual(multiH1.findingType, 'informational');
  });

  // =========================================================================
  // TEST 6: Heading Hierarchy Skips
  // =========================================================================
  await t.test('6. Heading hierarchy skip (H1 directly to H3 without H2) is detected', () => {
    const pageWithSkip: CrawledPageData = {
      url: 'https://example.com/skip',
      finalUrl: 'https://example.com/skip',
      redirectHops: [],
      redirectCount: 0,
      isRedirectChain: false,
      isRedirectLoop: false,
      statusCode: 200,
      loadTimeMs: 200,
      contentType: 'text/html',
      title: 'Valid Optimized Title Here',
      metaDescription: 'Valid optimized meta description that covers topic nicely and clearly.',
      canonicalUrl: 'https://example.com/skip',
      h1Elements: ['Main Topic'],
      h2Elements: [], // Missing H2!
      h3Elements: ['Deep Subsection'], // Jumps directly to H3
      h4Elements: [],
      h5Elements: [],
      h6Elements: [],
      mainContent: 'Body content.',
      wordCount: 150,
      internalLinks: [],
      externalLinks: [],
      images: [],
      schemas: [],
      hasMobileViewport: true,
      lang: 'en',
      openGraph: { title: 'T', description: 'D' },
      twitterCard: {},
      isClientSideRendered: false,
      isIndexable: true,
      isRobotsAllowed: true,
      rawHtmlSnippet: '',
    };

    const crawlResult: CrawlResult = {
      pages: [pageWithSkip],
      discoveredUrls: [pageWithSkip.url],
      crawledUrls: [pageWithSkip.url],
      skippedUrls: [],
      failedUrls: [],
      robotsTxt: { accessible: true, statusCode: 200, disallowRules: [], sitemaps: [] },
      sitemap: { accessible: true, urlCount: 1, sitemapsFound: [] },
      durationMs: 200,
      errors: [],
      coverage: { discovered: 1, crawled: 1, skipped: 0, failed: 0, remaining: 0, maxAllowedPages: 10, limitReached: false },
    };

    const findings = analyzeTechnicalSeo(crawlResult, generateUuid(), generateUuid());
    const skipFinding = findings.find(f => f.issueType === 'heading_hierarchy_skipped');
    assert.ok(skipFinding, 'Must detect heading hierarchy skip from H1 to H3');
  });

  // =========================================================================
  // TEST 7: Deduplicated Deterministic Scoring Engine
  // =========================================================================
  await t.test('7. Scoring Engine calculates 4 independent scores and does not multiply penalties linearly', () => {
    // Create 10 duplicate findings of the same issueType
    const duplicateFindings: AuditFinding[] = Array.from({ length: 10 }).map((_, i) => ({
      id: generateUuid(),
      auditRunId: generateUuid(),
      websiteId: generateUuid(),
      url: `https://example.com/page-${i}`,
      category: 'technical',
      issueType: 'missing_image_alt',
      severity: 'low', // Base penalty: 1.5
      title: 'Images Missing Alt Text',
      description: 'Image missing alt',
      recommendation: 'Add alt',
      confidenceLevel: 'high',
      detectionMethod: 'DOM check',
      evidence: { expected: 'alt', actual: 'none' },
      isResolved: false,
      createdAt: new Date().toISOString(),
    }));

    const scores = calculateAuditScores(duplicateFindings, 80, 85, 10, 10);

    assert.ok(scores.overallSeoScore >= 10 && scores.overallSeoScore <= 100);
    assert.strictEqual(scores.technicalScore >= 95, true, 'Duplicate low issues must be capped and not reduce score by 10 x 1.5 = 15');
    assert.strictEqual(scores.scoringVersion, '2.0');
    assert.strictEqual(scores.isProvisionalScore, false, 'Score should not be provisional with 10 crawled pages');

    // Test provisional score when crawl coverage is insufficient (< 3 pages)
    const provisionalScores = calculateAuditScores([], 70, 75, 2, 10);
    assert.strictEqual(provisionalScores.isProvisionalScore, true, 'Must flag provisional score when pagesCrawled < 3');
  });

  // =========================================================================
  // TEST 8: GEO & AEO Analyzers
  // =========================================================================
  await t.test('8. GEO and AEO analyzers detect schemas, question patterns, and provide clear explanations', () => {
    const page: CrawledPageData = {
      url: 'https://example.com/guide',
      finalUrl: 'https://example.com/guide',
      redirectHops: [],
      redirectCount: 0,
      isRedirectChain: false,
      isRedirectLoop: false,
      statusCode: 200,
      loadTimeMs: 300,
      contentType: 'text/html',
      title: 'Ultimate SEO Guide',
      metaDescription: 'Complete guide for SEO.',
      canonicalUrl: 'https://example.com/guide',
      h1Elements: ['Complete SEO Guide'],
      h2Elements: ['How does search indexing work?', 'What is entity optimization?'],
      h3Elements: [],
      h4Elements: [],
      h5Elements: [],
      h6Elements: [],
      mainContent: 'Search indexing is a process that catalogs content.',
      wordCount: 400,
      internalLinks: [],
      externalLinks: ['https://developer.mozilla.org', 'https://schema.org'],
      images: [],
      schemas: [
        {
          type: 'Organization',
          data: { name: 'Example Corp', sameAs: ['https://linkedin.com/company/example'] },
          isValidJson: true,
        },
      ],
      hasMobileViewport: true,
      lang: 'en',
      openGraph: {},
      twitterCard: {},
      isClientSideRendered: false,
      isIndexable: true,
      isRobotsAllowed: true,
      rawHtmlSnippet: '<p>Content</p>',
    };

    const geoResult = analyzeGeoSignals([page], generateUuid(), generateUuid());
    assert.strictEqual(geoResult.signals.hasOrganizationSchema, true, 'Must detect Organization schema');
    assert.strictEqual(geoResult.signals.hasOutboundCitations, true, 'Must detect outbound citations');

    const aeoResult = analyzeAeoSignals([page], generateUuid(), generateUuid());
    assert.strictEqual(aeoResult.signals.questionHeadingsCount, 2, 'Must detect 2 question-based headings');
  });

  // =========================================================================
  // TEST 9: Action Center Deduplication & Fix Verification
  // =========================================================================
  await t.test('9. Action Center prevents duplicate tasks for the same finding and supports fix verification', async () => {
    const findingId = generateUuid();
    const websiteId = generateUuid();
    const orgId = generateUuid();

    // Create first task from finding
    const task1 = await db.createActionItem({
      organizationId: orgId,
      websiteId,
      findingId,
      sourceType: 'audit_finding',
      title: 'Fix: Missing H1 Heading',
      affectedUrl: 'https://saasflow.io',
      status: 'todo',
    });

    assert.ok(task1.id, 'Task 1 must have an ID');

    // Attempt to create duplicate task for the exact same finding on this website
    const task2 = await db.createActionItem({
      organizationId: orgId,
      websiteId,
      findingId,
      sourceType: 'audit_finding',
      title: 'Fix: Missing H1 Heading',
      affectedUrl: 'https://saasflow.io',
      status: 'todo',
    });

    assert.strictEqual(task2.id, task1.id, 'Duplicate task creation must return existing task ID');

    // Mark task completed and verify fix
    task1.status = 'completed';
    const verifyResult = await verifyTaskFix(task1.id);
    assert.ok(verifyResult.outcome, 'Must return a verification outcome');
    assert.strictEqual(verifyResult.taskId, task1.id);
  });

  // =========================================================================
  // TEST 10: Reports Module Integration
  // =========================================================================
  await t.test('10. Reports generator creates immutable audit report with all 4 scores and coverage', async () => {
    const site = storage.addWebsite({
      name: 'Report Test Client',
      domain: 'saasflow.io',
      url: 'https://saasflow.io',
    });

    // Execute sample audit
    const auditResult = await executeWebsiteAudit(site.id, {
      maxPages: 2,
      maxDepth: 1,
      targetUrl: site.url,
      targetDomain: site.domain,
      targetName: site.name,
    });

    assert.ok(auditResult.auditRun, 'Audit run must be created');

    const report = await generateClientReportDataAsync(site.id, auditResult.auditRun.id);
    assert.ok(report, 'Report must be generated');
    assert.strictEqual(report?.website.id, site.id);
    assert.ok(typeof report?.scores.seoScore === 'number');
    assert.ok(typeof report?.scores.technicalScore === 'number');
    assert.ok(typeof report?.scores.geoScore === 'number');
    assert.ok(typeof report?.scores.aeoScore === 'number');
    assert.strictEqual(report?.auditEngineVersion, '2.0');
    assert.strictEqual(report?.scoringVersion, '2.0');
  });
});
