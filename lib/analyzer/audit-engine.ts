import { crawlWebsite, CrawlOptions } from '../crawler/crawler';
import { analyzeTechnicalSeo } from './technical-seo';
import { analyzeGeoSignals } from './geo-analyzer';
import { analyzeAeoSignals } from './aeo-analyzer';
import { calculateAuditScores, ScoreBreakdown } from './scoring';
import { storage } from '../storage';
import { supabase, isSupabaseConfigured } from '../supabase';
import { AuditRun, AuditFinding } from '../types';

export interface AuditOptions extends CrawlOptions {
  targetUrl?: string;
  targetDomain?: string;
  targetName?: string;
}

export interface AuditExecutionResult {
  auditRun: AuditRun;
  findings: AuditFinding[];
  scoreBreakdown: ScoreBreakdown;
  tasksCreatedCount: number;
}

export async function executeWebsiteAudit(
  websiteId: string,
  options: AuditOptions = {}
): Promise<AuditExecutionResult> {
  let website = storage.getWebsiteById(websiteId);

  // 1. If not found in memory, check Supabase
  if (!website && isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('websites').select('*').eq('id', websiteId).single();
      if (data) {
        website = {
          id: data.id,
          organizationId: data.organization_id,
          name: data.name,
          domain: data.domain,
          url: data.url,
          status: data.status || 'active',
          latestSeoScore: Number(data.latest_seo_score) || 0,
          latestGeoScore: Number(data.latest_geo_score) || 0,
          latestAeoScore: Number(data.latest_aeo_score) || 0,
          createdAt: data.created_at || new Date().toISOString(),
        };
        storage.addWebsite({
          id: website.id,
          name: website.name,
          domain: website.domain,
          url: website.url,
        });
      }
    } catch (e) {
      // Continue to targetUrl fallback
    }
  }

  // 2. If still not found, but targetUrl is provided, dynamically register the website
  if (!website && options.targetUrl) {
    const cleanDomain = options.targetDomain || options.targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    website = storage.addWebsite({
      id: websiteId,
      name: options.targetName || cleanDomain,
      domain: cleanDomain,
      url: options.targetUrl,
    });
  }

  if (!website) {
    throw new Error(`Website not found with ID "${websiteId}"`);
  }

  const auditRunId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `run-${Date.now()}`;
  const startTime = new Date().toISOString();

  // 1. Run safe crawl
  const crawlResult = await crawlWebsite(website.url, options);

  // 2. Technical SEO evaluation
  const technicalFindings = analyzeTechnicalSeo(crawlResult, websiteId, auditRunId, website.url);

  // 3. GEO signals evaluation
  const geoResult = analyzeGeoSignals(crawlResult.pages, websiteId, auditRunId, website.url);

  // 4. AEO signals evaluation
  const aeoResult = analyzeAeoSignals(crawlResult.pages, websiteId, auditRunId, website.url);

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

  // If Supabase is configured, also persist audit run and findings to PostgreSQL
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('audit_runs').insert({
        id: auditRun.id,
        website_id: websiteId,
        status: auditRun.status,
        pages_crawled: auditRun.pagesCrawled,
        seo_score: auditRun.seoScore,
        geo_score: auditRun.geoScore,
        aeo_score: auditRun.aeoScore,
        crawl_duration_ms: auditRun.crawlDurationMs,
        started_at: auditRun.startedAt,
        completed_at: auditRun.completedAt,
      });

      await supabase.from('websites').update({
        latest_seo_score: auditRun.seoScore,
        latest_geo_score: auditRun.geoScore,
        latest_aeo_score: auditRun.aeoScore,
        last_audited_at: auditRun.completedAt,
      }).eq('id', websiteId);

      if (allFindings.length > 0) {
        const findingRows = allFindings.map(f => ({
          id: f.id,
          audit_run_id: auditRun.id,
          website_id: websiteId,
          url: f.url,
          category: f.category,
          issue_type: f.issueType,
          severity: f.severity,
          title: f.title,
          description: f.description,
          recommendation: f.recommendation,
          confidence_level: f.confidenceLevel,
          detection_method: f.detectionMethod,
          is_resolved: f.isResolved,
        }));
        await supabase.from('audit_findings').insert(findingRows);
      }
    } catch (err) {
      console.error('Supabase audit persistence error:', err);
    }
  }

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
