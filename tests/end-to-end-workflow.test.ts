import test from 'node:test';
import assert from 'node:assert';
import { storage } from '../lib/storage';
import { executeWebsiteAudit } from '../lib/analyzer/audit-engine';
import { verifyTaskFix } from '../lib/verification/verification-engine';
import { syncGscPerformance } from '../lib/gsc/sync-engine';
import { discoverSeoOpportunities } from '../lib/gsc/opportunity-engine';
import { generateClientReportData } from '../lib/reports/report-generator';

test('Full End-to-End Customer Journey: Connect -> Analyze -> Discover -> Prioritize -> Execute -> Verify -> Report', async () => {
  // Step 1: Connect website
  const newSite = storage.addWebsite({
    name: 'EndToEnd Test Agency Property',
    domain: 'saasflow.io',
    url: 'https://saasflow.io',
  });
  assert.ok(newSite.id, 'Website must be registered with ID');

  // Step 2: Analyze - Execute Audit
  const auditResult = await executeWebsiteAudit(newSite.id, { maxPages: 5, maxDepth: 1 });
  assert.strictEqual(auditResult.auditRun.status, 'completed');
  assert.ok(auditResult.findings.length > 0, 'Must produce findings');

  // Step 3: Check Scores
  assert.ok(auditResult.auditRun.seoScore > 0, 'SEO score must be calculated');
  assert.ok(auditResult.auditRun.geoScore > 0, 'GEO score must be calculated');
  assert.ok(auditResult.auditRun.aeoScore > 0, 'AEO score must be calculated');

  // Step 4: Verify Task Creation in Action Center
  const tasks = storage.getActionItems(newSite.id);
  assert.ok(tasks.length > 0, 'Critical/high findings must create action tasks');
  const targetTask = tasks[0];

  // Step 5: Execute Work - Mark Task Completed
  storage.updateActionItemStatus(targetTask.id, 'completed');
  assert.strictEqual(targetTask.status, 'completed');

  // Step 6: Verify Improvements via Automated Re-Crawl
  const verification = await verifyTaskFix(targetTask.id);
  assert.ok(verification.outcome, 'Must produce verification outcome');
  assert.ok(
    ['completed_verified', 'still_unresolved', 'unable_to_verify'].includes(verification.outcome),
    `Outcome must be a valid verification outcome, got: ${verification.outcome}`
  );

  // Step 7: GSC Synchronization
  const gscSync = await syncGscPerformance(newSite.id, 28);
  assert.strictEqual(gscSync.propertyUrl, `sc-domain:${newSite.domain}`);
  assert.ok(gscSync.metrics.length > 0, 'Must ingest performance rows');

  // Step 8: Discover High-ROI SEO Opportunities
  const opportunities = discoverSeoOpportunities(newSite.id, gscSync.metrics);
  assert.ok(opportunities.length > 0, 'Must uncover striking distance opportunities');

  // Step 9: In-App Notification check
  const notifications = storage.getNotifications();
  assert.ok(notifications.length > 0, 'System must produce notifications for audit & verification');

  // Step 10: Generate Executive Client Report
  const clientReport = generateClientReportData(newSite.id);
  assert.ok(clientReport, 'Must generate report');
  assert.strictEqual(clientReport.website.name, newSite.name);
  assert.ok(clientReport.scores.seoScore > 0);
  assert.ok(clientReport.methodologyStatement.length > 20);
});
