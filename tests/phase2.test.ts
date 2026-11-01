import test from 'node:test';
import assert from 'node:assert';
import { validateUrlForSsrf } from '../lib/crawler/ssrf-guard.ts';
import { calculateAuditScores } from '../lib/analyzer/scoring.ts';
import { analyzeGeoSignals } from '../lib/analyzer/geo-analyzer.ts';
import { analyzeAeoSignals } from '../lib/analyzer/aeo-analyzer.ts';

test('SSRF Guard: Blocks loopback, private IPs, AWS metadata and non-standard ports', async () => {
  // Test loopback
  const loopback = await validateUrlForSsrf('http://127.0.0.1/admin');
  assert.strictEqual(loopback.isValid, false, 'Should block 127.0.0.1');

  // Test localhost
  const localhost = await validateUrlForSsrf('http://localhost:3000');
  assert.strictEqual(localhost.isValid, false, 'Should block localhost');

  // Test cloud metadata
  const metadata = await validateUrlForSsrf('http://169.254.169.254/latest/meta-data');
  assert.strictEqual(metadata.isValid, false, 'Should block AWS metadata IP');

  // Test private RFC 1918 range
  const priv = await validateUrlForSsrf('http://192.168.1.100');
  assert.strictEqual(priv.isValid, false, 'Should block 192.168.x.x');

  // Test non-standard port
  const badPort = await validateUrlForSsrf('http://example.com:8443');
  assert.strictEqual(badPort.isValid, false, 'Should block non-standard ports');

  // Test valid public domain
  const valid = await validateUrlForSsrf('https://example.com/blog');
  assert.strictEqual(valid.isValid, true, 'Should allow public valid domain');
});

test('Scoring Engine: Calculates transparent severity deductions and categories', () => {
  const mockFindings = [
    {
      id: 'f-1',
      auditRunId: 'r-1',
      websiteId: 'w-1',
      url: 'https://example.com',
      category: 'technical' as const,
      issueType: 'missing_h1',
      severity: 'critical' as const, // -15
      title: 'Missing H1',
      description: '...',
      recommendation: '...',
      confidenceLevel: 'high' as const,
      detectionMethod: '...',
      evidence: { expected: '...', actual: '...' },
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'f-2',
      auditRunId: 'r-1',
      websiteId: 'w-1',
      url: 'https://example.com',
      category: 'technical' as const,
      issueType: 'missing_title',
      severity: 'high' as const, // -8
      title: 'Missing Title',
      description: '...',
      recommendation: '...',
      confidenceLevel: 'high' as const,
      detectionMethod: '...',
      evidence: { expected: '...', actual: '...' },
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const scores = calculateAuditScores(mockFindings, 80, 75);
  // Technical score = 100 - 15 - 8 = 77
  assert.strictEqual(scores.categoryScores.technical, 77);
  assert.strictEqual(scores.geoScore, 80);
  assert.strictEqual(scores.aeoScore, 75);
  assert.ok(scores.overallSeoScore > 50 && scores.overallSeoScore < 100);
});

test('GEO & AEO Analyzers: Detects schemas and question patterns', () => {
  const samplePages = [
    {
      url: 'https://example.com/about',
      statusCode: 200,
      loadTimeMs: 120,
      contentType: 'text/html',
      title: 'About Us',
      metaDescription: 'About our company',
      h1Elements: ['About Us'],
      h2Elements: ['How does our technology work?'],
      h3Elements: [],
      schemas: [
        { type: 'Organization', data: { name: 'Acme Corp', url: 'https://example.com' } },
        { type: 'FAQPage', data: {} }
      ],
      internalLinks: [],
      externalLinks: ['https://wikipedia.org/wiki/Search_engine_optimization'],
      images: [],
      wordCount: 450,
      hasMobileViewport: true,
      openGraph: {},
      rawHtmlSnippet: '<html>...</html>',
    }
  ];

  const geoResult = analyzeGeoSignals(samplePages, 'w1', 'r1');
  assert.strictEqual(geoResult.signals.hasOrganizationSchema, true);
  assert.strictEqual(geoResult.signals.hasContactOrAbout, true);

  const aeoResult = analyzeAeoSignals(samplePages, 'w1', 'r1');
  assert.strictEqual(aeoResult.signals.hasFaqSchema, true);
  assert.strictEqual(aeoResult.signals.questionHeadingsCount, 1);
});
