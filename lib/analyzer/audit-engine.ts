import { crawlWebsite, CrawlOptions, CrawlResult } from '../crawler/crawler';
import { analyzeTechnicalSeo } from './technical-seo';
import { analyzeGeoSignals } from './geo-analyzer';
import { analyzeAeoSignals } from './aeo-analyzer';
import { calculateAuditScores, ScoreBreakdown } from './scoring';
import { storage } from '../storage';
import { db } from '../db';
import { AuditRun, AuditFinding, Website } from '../types';
import { generateUuid, isValidUuid } from '../utils';
import { NextRequest } from 'next/server';

export interface AuditOptions extends CrawlOptions {
  targetUrl?: string;
  targetDomain?: string;
  targetName?: string;
  plan?: string;
  maxAllowedPages?: number;
  crawlJobId?: string;
}

export interface AuditExecutionResult {
  auditRun: AuditRun;
  findings: AuditFinding[];
  scoreBreakdown: ScoreBreakdown;
  crawlResult: CrawlResult;
  tasksCreatedCount: number;
}

/**
 * Orchestrates a complete website crawl and multi-engine technical, GEO, and AEO analysis.
 */
export async function executeWebsiteAudit(
  websiteId: string,
  options: AuditOptions = {},
  req?: NextRequest | Headers | null
): Promise<AuditExecutionResult> {
  // 1. Resolve Website: First check database with auth context, then fallback to storage
  let website: Website | null = null;

  if (websiteId) {
    website = await db.getWebsiteById(websiteId, req);
  }

  if (!website && websiteId) {
    website = storage.getWebsiteById(websiteId) || null;
  }

  // If still not found, but targetUrl is provided, dynamically register the website
  if (!website && options.targetUrl) {
    const cleanDomain = options.targetDomain || options.targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    website = storage.addWebsite({
      id: websiteId || generateUuid(),
      name: options.targetName || cleanDomain,
      domain: cleanDomain,
      url: options.targetUrl,
    });
  }

  if (!website) {
    throw new Error(`Website not found with ID "${websiteId}"`);
  }

  const auditRunId = generateUuid();
  const startTime = new Date().toISOString();

  // 2. Run Safe Multi-Source Crawl
  const crawlResult = await crawlWebsite(website.url, options);

  // 3. Technical SEO & On-Page Analysis
  const technicalFindings = analyzeTechnicalSeo(crawlResult, website.id, auditRunId, website.url);

  // 4. GEO Signals Analysis
  const geoResult = analyzeGeoSignals(crawlResult.pages, website.id, auditRunId, website.url);

  // 5. AEO Signals Analysis
  const aeoResult = analyzeAeoSignals(crawlResult.pages, website.id, auditRunId, website.url);

  // 6. Aggregate Findings
  const allFindings: AuditFinding[] = [
    ...technicalFindings,
    ...geoResult.findings,
    ...aeoResult.findings,
  ];

  // 7. Calculate Deterministic Deduplicated Scores
  const scoreBreakdown = calculateAuditScores(
    allFindings,
    geoResult.score,
    aeoResult.score,
    crawlResult.pages.length,
    crawlResult.discoveredUrls.length
  );

  // 8. Tally Findings
  const findingsCount = {
    critical: allFindings.filter(f => f.severity === 'critical').length,
    high: allFindings.filter(f => f.severity === 'high').length,
    medium: allFindings.filter(f => f.severity === 'medium').length,
    low: allFindings.filter(f => f.severity === 'low' || f.severity === 'notice').length,
    notice: allFindings.filter(f => f.severity === 'notice').length,
    opportunities: allFindings.filter(f => f.findingType === 'opportunity').length,
    notTested: allFindings.filter(f => f.findingType === 'not_tested').length,
  };

  const auditRun: AuditRun = {
    id: auditRunId,
    websiteId: website.id,
    organizationId: website.organizationId,
    status: 'completed',
    pagesCrawled: crawlResult.pages.length,
    pagesDiscovered: crawlResult.coverage.discovered,
    pagesFailed: crawlResult.coverage.failed,
    seoScore: scoreBreakdown.overallSeoScore,
    technicalScore: scoreBreakdown.technicalScore,
    geoScore: scoreBreakdown.geoScore,
    aeoScore: scoreBreakdown.aeoScore,
    isProvisionalScore: scoreBreakdown.isProvisionalScore,
    crawlDurationMs: crawlResult.durationMs,
    scoreBreakdown,
    crawlLimits: {
      plan: options.plan || 'standard',
      maxAllowedPages: crawlResult.coverage.maxAllowedPages,
      limitReached: crawlResult.coverage.limitReached,
      reason: crawlResult.coverage.limitReason,
    },
    auditVersion: '2.0',
    scoringVersion: '2.0',
    startedAt: startTime,
    completedAt: new Date().toISOString(),
    findingsCount,
  };

  // 9. Persist Audit Run, Findings, and Score History to Supabase and storage
  storage.saveAuditRun(auditRun, allFindings);
  await db.saveAuditRun(auditRun, allFindings, req);

  // 10. Automatically convert Critical and High findings into Action Center tasks
  let tasksCreatedCount = 0;
  for (const finding of allFindings) {
    if (finding.severity === 'critical' || finding.severity === 'high') {
      try {
        await db.createActionItem({
          id: generateUuid(),
          organizationId: website.organizationId,
          websiteId: website.id,
          findingId: finding.id,
          auditRunId,
          sourceType: 'audit_finding',
          sourceId: finding.id,
          title: finding.title,
          description: finding.description,
          category: finding.category,
          priority: finding.severity === 'critical' ? 'critical' : 'high',
          severity: finding.severity,
          affectedUrl: finding.url,
          recommendedSolution: finding.recommendation,
          steps: finding.implementationSteps || [
            'Review current URL implementation against technical requirements.',
            'Deploy the recommended fix to production.',
            'Trigger Fix Verification in Action Center to re-evaluate detection rule.',
          ],
          verificationCriteria: finding.verificationCriteria || 'Page complies with search guidelines upon re-crawl.',
          estimatedEffort: finding.estimatedEffort || 'moderate',
          status: 'todo',
          verificationStatus: 'unverified',
        }, req);
        tasksCreatedCount++;
      } catch (e: any) {
        console.warn('Action item creation notice:', e.message);
      }
    }
  }

  // 11. Emit In-App Notification
  storage.addNotification({
    id: generateUuid(),
    organizationId: website.organizationId,
    websiteId: website.id,
    type: 'audit_completed',
    title: `Audit Completed: ${website.name}`,
    message: `Scored SEO: ${auditRun.seoScore}/100, Technical: ${auditRun.technicalScore}/100, GEO: ${auditRun.geoScore}/100, AEO: ${auditRun.aeoScore}/100. Discovered ${allFindings.length} findings (${findingsCount.critical} critical).`,
    severity: findingsCount.critical > 0 ? 'critical' : 'success',
    isRead: false,
    linkUrl: '/dashboard/audits',
    createdAt: new Date().toISOString(),
  });

  return {
    auditRun,
    findings: allFindings,
    scoreBreakdown,
    crawlResult,
    tasksCreatedCount,
  };
}
