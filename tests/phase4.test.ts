import test from 'node:test';
import assert from 'node:assert';
import { verifyTaskFix } from '../lib/verification/verification-engine';
import { storage } from '../lib/storage';
import { ActionItem } from '../lib/types';

test('Verification Engine: Re-crawl verification for completed tasks', async () => {
  // Setup a test task
  const testTask: ActionItem = {
    id: `test-task-1`,
    organizationId: 'org-101',
    websiteId: 'web-1',
    sourceType: 'audit_finding',
    title: 'Implement H1 Heading',
    description: 'Missing H1 heading on landing page',
    category: 'technical',
    priority: 'critical',
    affectedUrl: 'https://saasflow.io/features/customer-analytics',
    recommendedSolution: 'Add <h1> tag',
    steps: ['Add H1 tag'],
    status: 'completed',
    verificationStatus: 'unverified',
    createdAt: new Date().toISOString(),
  };

  storage.addActionItem(testTask);

  const result = await verifyTaskFix(testTask.id);

  assert.ok(result, 'Must return verification result');
  assert.strictEqual(result.taskId, testTask.id);
  assert.ok(
    result.outcome === 'completed_verified' || result.outcome === 'still_unresolved',
    'Outcome must be a valid verification outcome'
  );
  assert.ok(result.afterEvidence.length > 0, 'Must record after-evidence');
});

test('Verification Engine: SSRF protection blocks verification of private IP targets', async () => {
  const ssrfTask: ActionItem = {
    id: `test-task-ssrf`,
    organizationId: 'org-101',
    websiteId: 'web-1',
    sourceType: 'manual',
    title: 'SSRF Verification Attempt',
    description: 'Attempting to verify internal IP',
    category: 'technical',
    priority: 'critical',
    affectedUrl: 'http://169.254.169.254/latest/meta-data',
    recommendedSolution: 'N/A',
    steps: [],
    status: 'completed',
    verificationStatus: 'unverified',
    createdAt: new Date().toISOString(),
  };

  storage.addActionItem(ssrfTask);

  const result = await verifyTaskFix(ssrfTask.id);

  assert.strictEqual(result.outcome, 'unable_to_verify');
  assert.ok(result.explanation.includes('failed security checks') || result.explanation.includes('Blocked'));
});
