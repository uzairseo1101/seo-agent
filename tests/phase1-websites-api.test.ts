import test from 'node:test';
import assert from 'node:assert';
import { storage } from '../lib/storage';
import { executeWebsiteAudit } from '../lib/analyzer/audit-engine';

test('Phase 1: Website Creation & Audit ID Flow Verification', async () => {
  // Test 1: UUID generation on creation with resolvable domain
  const realDomain = 'saasflow.io';
  const added = storage.addWebsite({
    name: 'Phase 1 Verified Client',
    domain: realDomain,
    url: `https://${realDomain}`,
  });

  assert.ok(added.id, 'Website must have an ID');
  assert.strictEqual(added.domain, realDomain);
  assert.strictEqual(added.status, 'active');

  // Test 2: Website resolution by ID in storage
  const found = storage.getWebsiteById(added.id);
  assert.ok(found, 'Website must be retrievable by ID');
  assert.strictEqual(found?.id, added.id);

  // Test 3: Audit execution with this ID must not fail with "not found"
  const auditResult = await executeWebsiteAudit(added.id, {
    maxPages: 3,
    maxDepth: 1,
    targetUrl: added.url,
    targetDomain: added.domain,
    targetName: added.name,
  });

  assert.ok(auditResult.auditRun, 'Audit run record must be created');
  assert.strictEqual(auditResult.auditRun.websiteId, added.id);
  assert.strictEqual(auditResult.auditRun.status, 'completed');

  // Test 4: Dynamic on-the-fly resolution for unknown ID when targetUrl is provided
  const dynamicId = 'web-freshly-created-999';
  const dynamicResult = await executeWebsiteAudit(dynamicId, {
    maxPages: 2,
    maxDepth: 1,
    targetUrl: 'https://saasflow.io',
    targetDomain: 'saasflow.io',
    targetName: 'SaasFlow IO',
  });

  assert.ok(dynamicResult.auditRun, 'Audit run must succeed with targetUrl fallback');
  assert.strictEqual(dynamicResult.auditRun.websiteId, dynamicId);

  // Test 5: Clean deletion
  const deleted = storage.deleteWebsite(added.id);
  assert.strictEqual(deleted, true, 'Website must be deleted');
  assert.strictEqual(storage.getWebsiteById(added.id), undefined);
});
