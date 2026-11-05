import { executeWebsiteAudit, AuditExecutionResult } from '../analyzer/audit-engine';
import { db } from '../db';
import { storage } from '../storage';
import { CrawlJob, CrawlJobStatus, Website } from '../types';
import { generateUuid, isValidUuid } from '../utils';
import { NextRequest } from 'next/server';

// In-memory active job cancellation tokens
const activeJobCancellations = new Set<string>();

export function cancelCrawlJob(jobId: string) {
  activeJobCancellations.add(jobId);
}

export function isJobCancelled(jobId: string): boolean {
  return activeJobCancellations.has(jobId);
}

export interface StartJobParams {
  websiteId: string;
  organizationId?: string;
  maxPages: number;
  maxDepth: number;
  plan?: string;
  targetUrl?: string;
  targetDomain?: string;
  targetName?: string;
  req?: NextRequest | Headers | null;
}

/**
 * Initializes and starts a durable background crawl and audit job
 */
export async function startBackgroundCrawlJob(params: StartJobParams): Promise<CrawlJob> {
  const { websiteId, maxPages, maxDepth, plan = 'free', targetUrl, targetDomain, targetName, req } = params;

  // 1. Resolve Website
  let website: Website | null = null;
  if (websiteId) {
    website = await db.getWebsiteById(websiteId, req);
  }
  if (!website && websiteId) {
    website = storage.getWebsiteById(websiteId) || null;
  }
  if (!website && targetUrl) {
    const cleanDomain = targetDomain || targetUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    website = storage.addWebsite({
      id: isValidUuid(websiteId) ? websiteId : generateUuid(),
      name: targetName || cleanDomain,
      domain: cleanDomain,
      url: targetUrl,
    });
  }

  if (!website) {
    throw new Error(`Website not found with ID "${websiteId}"`);
  }

  const jobId = generateUuid();
  const auditRunId = generateUuid();
  const orgId = website.organizationId || params.organizationId || '00000000-0000-0000-0000-000000000001';

  // 2. Create durable CrawlJob in Supabase and storage
  const job = await db.createCrawlJob({
    id: jobId,
    websiteId: website.id,
    auditRunId,
    organizationId: orgId,
    status: 'queued',
    progressPercent: 2,
    currentStage: 'Queued in audit pipeline',
    urlsDiscovered: 1,
    urlsCrawled: 0,
    urlsRemaining: 1,
    urlsFailed: 0,
    maxPages,
    maxDepth,
    startedAt: new Date().toISOString(),
  }, req);

  // 3. Kick off async execution detached from current request
  (async () => {
    try {
      if (isJobCancelled(jobId)) {
        await db.updateCrawlJob(jobId, { status: 'cancelled', currentStage: 'Audit cancelled by user' }, req);
        activeJobCancellations.delete(jobId);
        return;
      }

      await db.updateCrawlJob(jobId, {
        status: 'crawling',
        progressPercent: 5,
        currentStage: 'Validating robots.txt & parsing XML sitemaps',
      }, req);

      // Execute audit with live progress callback
      const result = await executeWebsiteAudit(
        website!.id,
        {
          maxPages,
          maxDepth,
          targetUrl: website!.url,
          targetDomain: website!.domain,
          targetName: website!.name,
          plan,
          crawlJobId: jobId,
          onProgress: async (progress) => {
            if (isJobCancelled(jobId)) {
              throw new Error('Audit cancelled by user');
            }

            let status: CrawlJobStatus = 'crawling';
            if (progress.percent >= 80 && progress.percent < 90) {
              status = 'analyzing';
            } else if (progress.percent >= 90) {
              status = 'generating_recommendations';
            }

            await db.updateCrawlJob(jobId, {
              status,
              progressPercent: progress.percent,
              currentStage: progress.stage,
              urlsDiscovered: progress.discovered,
              urlsCrawled: progress.crawled,
              urlsRemaining: progress.remaining,
              urlsFailed: progress.failed,
            }, req);
          },
        },
        req
      );

      // Check if limit reached or partially completed
      const finalStatus: CrawlJobStatus = result.crawlResult.coverage.limitReached && result.crawlResult.coverage.remaining > 0
        ? 'partially_completed'
        : 'completed';

      await db.updateCrawlJob(jobId, {
        status: finalStatus,
        progressPercent: 100,
        currentStage: 'Audit & intelligence analysis completed',
        urlsDiscovered: result.crawlResult.coverage.discovered,
        urlsCrawled: result.crawlResult.coverage.crawled,
        urlsRemaining: 0,
        urlsFailed: result.crawlResult.coverage.failed,
        auditRunId: result.auditRun.id,
        completedAt: new Date().toISOString(),
      }, req);

      activeJobCancellations.delete(jobId);
    } catch (err: any) {
      const isCancelled = isJobCancelled(jobId) || err.message?.includes('cancelled');
      await db.updateCrawlJob(jobId, {
        status: isCancelled ? 'cancelled' : 'failed',
        errorMessage: err.message || 'Audit encountered an unexpected error',
        currentStage: isCancelled ? 'Audit cancelled' : `Audit failed: ${err.message}`,
        completedAt: new Date().toISOString(),
      }, req);
      activeJobCancellations.delete(jobId);
    }
  })();

  return job;
}
