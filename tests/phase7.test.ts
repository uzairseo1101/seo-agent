import test from 'node:test';
import assert from 'node:assert';
import { recordFindingFeedback, getFindingFeedback } from '../lib/trust/feedback-service';
import { calculateAuditScores } from '../lib/analyzer/scoring';

test('Trust Framework: Records and retrieves finding feedback records', () => {
  const record = recordFindingFeedback(
    'fnd-sample-1',
    'usr-001',
    'correct',
    'Accurately flagged missing H1 heading'
  );

  assert.ok(record.id.startsWith('fb-'));
  assert.strictEqual(record.findingId, 'fnd-sample-1');
  assert.strictEqual(record.feedbackType, 'correct');

  const history = getFindingFeedback('fnd-sample-1');
  assert.strictEqual(history.length, 1);
  assert.strictEqual(history[0].comments, 'Accurately flagged missing H1 heading');
});

test('Scoring Integrity: Category weighting is mathematically deterministic', () => {
  const mockFindings = [
    {
      id: 'f-tech-1',
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
      id: 'f-ind-1',
      auditRunId: 'r-1',
      websiteId: 'w-1',
      url: 'https://example.com',
      category: 'indexability' as const,
      issueType: 'missing_canonical',
      severity: 'medium' as const, // -4
      title: 'Missing Canonical',
      description: '...',
      recommendation: '...',
      confidenceLevel: 'high' as const,
      detectionMethod: '...',
      evidence: { expected: '...', actual: '...' },
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'f-cnt-1',
      auditRunId: 'r-1',
      websiteId: 'w-1',
      url: 'https://example.com',
      category: 'content' as const,
      issueType: 'short_meta_description',
      severity: 'low' as const, // -1.5
      title: 'Short Meta',
      description: '...',
      recommendation: '...',
      confidenceLevel: 'high' as const,
      detectionMethod: '...',
      evidence: { expected: '...', actual: '...' },
      isResolved: false,
      createdAt: new Date().toISOString(),
    },
  ];

  const scores = calculateAuditScores(mockFindings, 85, 90);

  // Technical = 100 - 15 = 85
  // Indexability = 100 - 4 = 96
  // Content = 100 - 1.5 = 98.5
  // Weighted: (85 * 0.45) + (96 * 0.30) + (98.5 * 0.25) = 38.25 + 28.8 + 24.625 = 91.675 -> 91.7
  assert.strictEqual(scores.categoryScores.technical, 85);
  assert.strictEqual(scores.categoryScores.indexability, 96);
  assert.strictEqual(scores.categoryScores.content, 98.5);
  assert.strictEqual(scores.overallSeoScore, 91.7);
});
