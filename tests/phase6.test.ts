import test from 'node:test';
import assert from 'node:assert';
import { generateClientReportData } from '../lib/reports/report-generator';
import { storage } from '../lib/storage';

test('Report Generator: Compiles complete client report with verified improvements', () => {
  const testSite = storage.addWebsite({
    name: 'Test Client Analytics',
    domain: 'saasflow.io',
    url: 'https://saasflow.io',
  });
  testSite.latestSeoScore = 85;
  testSite.latestGeoScore = 78;
  testSite.latestAeoScore = 88;

  const report = generateClientReportData(testSite.id, '2026-10-01', '2026-10-31');

  assert.ok(report, 'Must generate report');
  assert.strictEqual(report.website.name, testSite.name);
  assert.strictEqual(report.period.start, '2026-10-01');
  assert.strictEqual(report.period.end, '2026-10-31');
  assert.ok(report.scores.seoScore > 0, 'Must include SEO score');
  assert.ok(report.scores.geoScore > 0, 'Must include GEO score');
  assert.ok(report.scores.aeoScore > 0, 'Must include AEO score');
  assert.ok(report.methodologyStatement.length > 50, 'Must include complete methodology disclaimer');
});

test('Notification System: Manages read states and unread counters', () => {
  const initialUnread = storage.getNotifications().filter(n => !n.isRead).length;

  storage.addNotification({
    id: 'test-notif-1',
    organizationId: 'org-101',
    type: 'critical_finding',
    title: 'Test Notification',
    message: 'Testing notification creation',
    severity: 'critical',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  const updatedUnread = storage.getNotifications().filter(n => !n.isRead).length;
  assert.strictEqual(updatedUnread, initialUnread + 1, 'Unread count should increment');

  storage.markAllNotificationsAsRead();
  const finalUnread = storage.getNotifications().filter(n => !n.isRead).length;
  assert.strictEqual(finalUnread, 0, 'All notifications must be marked read');
});
