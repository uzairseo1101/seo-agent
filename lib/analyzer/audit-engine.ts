import { crawlWebsite, CrawlOptions } from '../crawler/crawler';
import { analyzeTechnicalSeo } from './technical-seo';
import { analyzeGeoSignals } from './geo-analyzer';
import { analyzeAeoSignals } from './aeo-analyzer';
import { calculateAuditScores, ScoreBreakdown } from './scoring';
import { storage } from '../storage';
import { AuditRun, AuditFinding } from '../types';

export interface AuditExecutionResult {
  auditRun: AuditRun;
  findings: AuditFinding[];
  scoreBreakdown: ScoreBreakdown;
  tasksCreatedCount: number;
}

export async function executeWebsiteAudit(
  websiteId: string,
  options: CrawlOptions = {}
): Promise<AuditExecutionResult> {
  const website = storage.getWebsiteById(websiteId);
  if (!website) {
    throw new Error(`Website not found with ID "${websiteId}"`);
  }

  const auditRunId = `run-${Date.now()}`;
  const startTime = new Date().toISOString();

  // 1. Run safe crawl
  const crawlResult = await crawlWebsite(website.url, options);

  // 2. Technical SEO evaluation
  const technicalFindings = analyzeTechnicalSeo(crawlResult, websiteId, auditRunId);

  // 3. GEO signals evaluation
  const geoResult = analyzeGeoSignals(crawlResult.pages, websiteId, auditRunId);

  // 4. AEO signals evaluation
  const aeoResult = analyzeAeoSignals(crawlResult.pages, websiteId, auditRunId);

  // 5. Aggregate all findings
  const allFindings = [
    ...technicalFindings,
    ...geoResult.findings,
    ...aeoResult.findings,
  ];

  // 6. Calculate transparent scores
  const scoreBreakdown = calculateAuditScores(
    allFindings,
    geoResult.score,
    aeoResult.score
  );

  // 7. Assemble Audit Run record
  const findingsCount = {
    critical: allFindings.filter(f => f.severity === 'critical').length,
    high: allFindings.filter(f => f.severity === 'high').length,
    medium: allFindings.filter(f => f.severity === 'medium').length,
    low: allFindings.filter(f => f.severity === 'low' || f.severity === 'info').length,
  };

  const auditRun: AuditRun = {
    id: auditRunId,
    websiteId,
    status: 'completed',
    pagesCrawled: crawlResult.pages.length,
    seoScore: scoreBreakdown.overallSeoScore,
    geoScore: scoreBreakdown.geoScore,
    aeoScore: scoreBreakdown.aeoScore,
    crawlDurationMs: crawlResult.durationMs,
    startedAt: startTime,
    completedAt: new Date().toISOString(),
    findingsCount,
  };

  // 8. Update storage with audit run, findings, and website scores
  storage.saveAuditRun(auditRun, allFindings);

  // 9. Automatically convert Critical and High findings into Action Center tasks
  let tasksCreatedCount = 0;
  for (const finding of allFindings) {
    if (finding.severity === 'critical' || finding.severity === 'high') {
      const task = storage.createActionItemFromFinding(finding.id);
      if (task) tasksCreatedCount++;
    }
  }

  // 10. Emit Notification
  storage.addNotification({
    id: `notif-${Date.now()}`,
    organizationId: website.organizationId,
    websiteId: website.id,
    type: 'audit_completed',
    title: `Audit Completed: ${website.name}`,
    message: `Scored SEO: ${auditRun.seoScore}, GEO: ${auditRun.geoScore}, AEO: ${auditRun.aeoScore}. Identified ${allFindings.length} findings (${findingsCount.critical} critical).`,
    severity: findingsCount.critical > 0 ? 'critical' : 'success',
    isRead: false,
    linkUrl: '/dashboard/audits',
    createdAt: new Date().toISOString(),
  });

  return {
    auditRun,
    findings: allFindings,
    scoreBreakdown,
    tasksCreatedCount,
  };
}
