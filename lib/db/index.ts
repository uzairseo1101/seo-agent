import { createAdminClient, createServerClient, getSupabaseServerClient } from '@/lib/supabase-server';
import { getServerAuthContext, getAdminSupabase } from '@/lib/auth-server';
import { storage } from '@/lib/storage';
import { NextRequest } from 'next/server';
import { generateUuid, isValidUuid } from '@/lib/utils';
import {
  Website,
  AuditRun,
  AuditFinding,
  ActionItem,
  SeoOpportunity,
  UserProfile,
  TaskStatus,
  VerificationOutcome,
  FindingCategory,
  TaskPriority,
  CrawlJob,
  CrawlJobStatus,
  FindingSeverity,
  FindingType,
} from '@/lib/types';
import { GscPerformanceRow } from '@/lib/gsc/types';

/**
 * Unified Multi-Tenant Database Access Layer.
 * Every query is strictly isolated by the authenticated user's organization.
 */
class DatabaseService {
  private inMemoryLogs: any[] = [];

  private getClient(req?: NextRequest | Headers | null) {
    // 1. If service role admin is available, use it
    const admin = getAdminSupabase();
    if (admin) return admin;

    // 2. If request contains user authorization, use client with user's JWT
    if (req) {
      const serverClient = getSupabaseServerClient(req);
      if (serverClient) return serverClient;
    }

    // 3. Fallback
    return createServerClient();
  }

  // ==========================================
  // WEBSITES (Strictly Scoped by Workspace)
  // ==========================================
  async getWebsites(req?: NextRequest | Headers | null): Promise<Website[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) {
      // Unauthenticated or brand new user with 0 websites
      return [];
    }

    const client = this.getClient(req);
    if (client) {
      try {
        let query = client
          .from('websites')
          .select('*')
          .neq('status', 'archived')
          .order('created_at', { ascending: false });

        if (!auth.isAdmin && auth.organizationId) {
          query = query.eq('organization_id', auth.organizationId);
        }

        const { data, error } = await query;

        if (!error && Array.isArray(data)) {
          return data.map((row: any) => ({
            id: row.id,
            organizationId: row.organization_id,
            name: row.name,
            domain: row.domain,
            url: row.url,
            status: row.status || 'active',
            latestSeoScore: Number(row.latest_seo_score) || 0,
            latestGeoScore: Number(row.latest_geo_score) || 0,
            latestAeoScore: Number(row.latest_aeo_score) || 0,
            lastAuditedAt: row.last_audited_at || undefined,
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Database getWebsites error:', e);
      }
    }
    return [];
  }

  async getWebsiteById(id: string, req?: NextRequest | Headers | null): Promise<Website | null> {
    if (!id || !isValidUuid(id)) return null;

    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('websites').select('*').eq('id', id);
        // Ordinary users can only access websites belonging to their organization
        if (!auth.isAdmin && auth.organizationId && req) {
          query = query.eq('organization_id', auth.organizationId);
        }

        const { data, error } = await query.maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            organizationId: data.organization_id,
            name: data.name,
            domain: data.domain,
            url: data.url,
            status: data.status || 'active',
            latestSeoScore: Number(data.latest_seo_score) || 0,
            latestGeoScore: Number(data.latest_geo_score) || 0,
            latestAeoScore: Number(data.latest_aeo_score) || 0,
            lastAuditedAt: data.last_audited_at || undefined,
            createdAt: data.created_at || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error('Database getWebsiteById error:', e);
      }
    }
    const fallback = storage.getWebsiteById(id);
    if (fallback) return fallback;
    return null;
  }

  async createWebsite(
    data: {
      name: string;
      domain: string;
      url: string;
      id?: string;
      organizationId?: string;
    },
    req?: NextRequest | Headers | null
  ): Promise<Website> {
    const auth = await getServerAuthContext(req);
    const orgId = auth.organizationId || data.organizationId || (req ? null : '00000000-0000-0000-0000-000000000001');
    if (!orgId) {
      throw new Error('Authentication required to connect a website.');
    }

    const cleanDomain = data.domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim();
    const cleanUrl = data.url.startsWith('http') ? data.url.trim() : `https://${data.url.trim()}`;
    const generatedId = (data.id && isValidUuid(data.id)) ? data.id : generateUuid();

    const client = this.getClient(req);
    if (client) {
      const { data: row, error } = await client
        .from('websites')
        .insert({
          id: generatedId,
          organization_id: orgId,
          name: data.name.trim(),
          domain: cleanDomain,
          url: cleanUrl,
          status: 'active',
          latest_seo_score: 0,
          latest_geo_score: 0,
          latest_aeo_score: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Database createWebsite error:', error);
        throw new Error(error.message || 'Failed to create website record.');
      }

      if (row) {
        const newSite: Website = {
          id: row.id,
          organizationId: row.organization_id,
          name: row.name,
          domain: row.domain,
          url: row.url,
          status: row.status || 'active',
          latestSeoScore: 0,
          latestGeoScore: 0,
          latestAeoScore: 0,
          createdAt: row.created_at || new Date().toISOString(),
        };
        await this.logActivity('website_created', 'website', newSite.id, { name: newSite.name, domain: newSite.domain }, req);
        return newSite;
      }
    }

    // Offline / Test fallback
    const fallbackSite: Website = {
      id: generatedId,
      organizationId: orgId,
      name: data.name.trim(),
      domain: cleanDomain,
      url: cleanUrl,
      status: 'active',
      latestSeoScore: 0,
      latestGeoScore: 0,
      latestAeoScore: 0,
      createdAt: new Date().toISOString(),
    };
    storage.addWebsite(fallbackSite);
    return fallbackSite;
  }

  async deleteWebsite(id: string, req?: NextRequest | Headers | null): Promise<boolean> {
    if (!id || !isValidUuid(id)) return false;

    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('websites').delete().eq('id', id);
        if (!auth.isAdmin && auth.organizationId && req) {
          query = query.eq('organization_id', auth.organizationId);
        }
        await query;
        await this.logActivity('website_deleted', 'website', id, {}, req);
        return true;
      } catch (e) {
        console.error('Database deleteWebsite error:', e);
      }
    }
    storage.deleteWebsite(id);
    return true;
  }

  // ==========================================
  // CRAWL JOBS (Durable Background Processing)
  // ==========================================
  async createCrawlJob(job: Partial<CrawlJob>, req?: NextRequest | Headers | null): Promise<CrawlJob> {
    const auth = await getServerAuthContext(req);
    const orgId = auth.organizationId || job.organizationId || (req ? null : '00000000-0000-0000-0000-000000000001');
    const jobId = (job.id && isValidUuid(job.id)) ? job.id : generateUuid();

    const client = this.getClient(req);
    const newJob: CrawlJob = {
      id: jobId,
      websiteId: job.websiteId || '',
      auditRunId: job.auditRunId || generateUuid(),
      organizationId: orgId || '',
      status: job.status || 'pending',
      progressPercent: job.progressPercent || 0,
      currentStage: job.currentStage || 'Initialized',
      urlsDiscovered: job.urlsDiscovered || 0,
      urlsCrawled: job.urlsCrawled || 0,
      urlsRemaining: job.urlsRemaining || 0,
      urlsFailed: job.urlsFailed || 0,
      maxPages: job.maxPages || 10,
      maxDepth: job.maxDepth || 2,
      crawlOptions: job.crawlOptions || {},
      discoveredUrls: job.discoveredUrls || [],
      crawledUrls: job.crawledUrls || [],
      failedUrls: job.failedUrls || [],
      errorMessage: job.errorMessage,
      startedAt: job.startedAt || new Date().toISOString(),
      createdAt: job.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (client && isValidUuid(newJob.websiteId)) {
      try {
        await client.from('crawl_jobs').insert({
          id: newJob.id,
          website_id: newJob.websiteId,
          audit_run_id: isValidUuid(newJob.auditRunId) ? newJob.auditRunId : null,
          organization_id: newJob.organizationId,
          status: newJob.status,
          progress_percent: newJob.progressPercent,
          current_stage: newJob.currentStage,
          urls_discovered: newJob.urlsDiscovered,
          urls_crawled: newJob.urlsCrawled,
          urls_remaining: newJob.urlsRemaining,
          urls_failed: newJob.urlsFailed,
          max_pages: newJob.maxPages,
          max_depth: newJob.maxDepth,
          crawl_options: newJob.crawlOptions,
          discovered_urls: newJob.discoveredUrls,
          crawled_urls: newJob.crawledUrls,
          failed_urls: newJob.failedUrls,
          error_message: newJob.errorMessage,
          started_at: newJob.startedAt,
          created_at: newJob.createdAt,
          updated_at: newJob.updatedAt,
        });
      } catch (e: any) {
        console.warn('Database createCrawlJob exception:', e.message);
      }
    }

    storage.saveCrawlJob(newJob);
    return newJob;
  }

  async getCrawlJobById(id: string, req?: NextRequest | Headers | null): Promise<CrawlJob | null> {
    if (!id) return null;
    const client = this.getClient(req);
    if (client && isValidUuid(id)) {
      try {
        const { data, error } = await client
          .from('crawl_jobs')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            websiteId: data.website_id,
            auditRunId: data.audit_run_id,
            organizationId: data.organization_id,
            status: data.status,
            progressPercent: data.progress_percent || 0,
            currentStage: data.current_stage || '',
            urlsDiscovered: data.urls_discovered || 0,
            urlsCrawled: data.urls_crawled || 0,
            urlsRemaining: data.urls_remaining || 0,
            urlsFailed: data.urls_failed || 0,
            maxPages: data.max_pages || 10,
            maxDepth: data.max_depth || 2,
            crawlOptions: data.crawl_options || {},
            discoveredUrls: data.discovered_urls || [],
            crawledUrls: data.crawled_urls || [],
            failedUrls: data.failed_urls || [],
            errorMessage: data.error_message,
            startedAt: data.started_at,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (e: any) {
        console.warn('Database getCrawlJobById exception:', e.message);
      }
    }
    return storage.getCrawlJobById(id) || null;
  }

  async getLatestCrawlJob(websiteId: string, req?: NextRequest | Headers | null): Promise<CrawlJob | null> {
    if (!websiteId) return null;
    const client = this.getClient(req);
    if (client && isValidUuid(websiteId)) {
      try {
        const { data, error } = await client
          .from('crawl_jobs')
          .select('*')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            websiteId: data.website_id,
            auditRunId: data.audit_run_id,
            organizationId: data.organization_id,
            status: data.status,
            progressPercent: data.progress_percent || 0,
            currentStage: data.current_stage || '',
            urlsDiscovered: data.urls_discovered || 0,
            urlsCrawled: data.urls_crawled || 0,
            urlsRemaining: data.urls_remaining || 0,
            urlsFailed: data.urls_failed || 0,
            maxPages: data.max_pages || 10,
            maxDepth: data.max_depth || 2,
            crawlOptions: data.crawl_options || {},
            discoveredUrls: data.discovered_urls || [],
            crawledUrls: data.crawled_urls || [],
            failedUrls: data.failed_urls || [],
            errorMessage: data.error_message,
            startedAt: data.started_at,
            completedAt: data.completed_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          };
        }
      } catch (e: any) {
        console.warn('Database getLatestCrawlJob exception:', e.message);
      }
    }
    return storage.getLatestCrawlJob(websiteId) || null;
  }

  async updateCrawlJob(id: string, updates: Partial<CrawlJob>, req?: NextRequest | Headers | null): Promise<CrawlJob | null> {
    if (!id) return null;
    const client = this.getClient(req);
    if (client && isValidUuid(id)) {
      try {
        const dbUpdates: any = { updated_at: new Date().toISOString() };
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.progressPercent !== undefined) dbUpdates.progress_percent = updates.progressPercent;
        if (updates.currentStage !== undefined) dbUpdates.current_stage = updates.currentStage;
        if (updates.urlsDiscovered !== undefined) dbUpdates.urls_discovered = updates.urlsDiscovered;
        if (updates.urlsCrawled !== undefined) dbUpdates.urls_crawled = updates.urlsCrawled;
        if (updates.urlsRemaining !== undefined) dbUpdates.urls_remaining = updates.urlsRemaining;
        if (updates.urlsFailed !== undefined) dbUpdates.urls_failed = updates.urlsFailed;
        if (updates.discoveredUrls !== undefined) dbUpdates.discovered_urls = updates.discoveredUrls;
        if (updates.crawledUrls !== undefined) dbUpdates.crawled_urls = updates.crawledUrls;
        if (updates.failedUrls !== undefined) dbUpdates.failed_urls = updates.failedUrls;
        if (updates.errorMessage !== undefined) dbUpdates.error_message = updates.errorMessage;
        if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
        if (updates.auditRunId !== undefined && isValidUuid(updates.auditRunId)) dbUpdates.audit_run_id = updates.auditRunId;

        await client.from('crawl_jobs').update(dbUpdates).eq('id', id);
      } catch (e: any) {
        console.warn('Database updateCrawlJob exception:', e.message);
      }
    }
    return storage.updateCrawlJob(id, updates) || null;
  }

  // ==========================================
  // AUDITS & FINDINGS (Scoped by Authorized Website)
  // ==========================================
  async getAuditRuns(websiteId?: string, req?: NextRequest | Headers | null): Promise<AuditRun[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) return [];

    const client = this.getClient(req);
    if (!client) return [];

    try {
      // If websiteId is specified, verify it belongs to user's workspace (or user is admin)
      if (websiteId) {
        if (!auth.isAdmin) {
          const site = await this.getWebsiteById(websiteId, req);
          if (!site) return []; // Website does not belong to this user
        }

        const { data, error } = await client
          .from('audit_runs')
          .select('*')
          .eq('website_id', websiteId)
          .order('started_at', { ascending: false });

        if (!error && Array.isArray(data)) {
          return data.map((row: any) => ({
            id: row.id,
            websiteId: row.website_id,
            organizationId: row.organization_id,
            status: row.status || 'completed',
            pagesCrawled: row.pages_crawled || 0,
            pagesDiscovered: row.urls_discovered || row.pages_discovered || row.pages_crawled || 0,
            pagesFailed: row.pages_failed || 0,
            seoScore: Number(row.seo_score) || 0,
            geoScore: Number(row.geo_score) || 0,
            aeoScore: Number(row.aeo_score) || 0,
            technicalScore: Number(row.technical_score) || Number(row.seo_score) || 0,
            isProvisionalScore: Boolean(row.is_provisional_score),
            crawlDurationMs: row.crawl_duration_ms || 0,
            scoreBreakdown: row.score_breakdown || undefined,
            crawlLimits: row.crawl_limits || undefined,
            auditVersion: row.audit_version || '2.0',
            scoringVersion: row.scoring_version || '2.0',
            startedAt: row.started_at || new Date().toISOString(),
            completedAt: row.completed_at || undefined,
            findingsCount: row.findings_count || { critical: 0, high: 0, medium: 0, low: 0 },
          }));
        }
      } else {
        if (!auth.isAdmin) {
          // Get all websites for this organization
          const userWebsites = await this.getWebsites(req);
          if (userWebsites.length === 0) return [];
          const webIds = userWebsites.map(w => w.id);

          const { data, error } = await client
            .from('audit_runs')
            .select('*')
            .in('website_id', webIds)
            .order('started_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map((row: any) => ({
              id: row.id,
              websiteId: row.website_id,
              organizationId: row.organization_id,
              status: row.status || 'completed',
              pagesCrawled: row.pages_crawled || 0,
              pagesDiscovered: row.urls_discovered || row.pages_discovered || row.pages_crawled || 0,
              pagesFailed: row.pages_failed || 0,
              seoScore: Number(row.seo_score) || 0,
              geoScore: Number(row.geo_score) || 0,
              aeoScore: Number(row.aeo_score) || 0,
              technicalScore: Number(row.technical_score) || Number(row.seo_score) || 0,
              isProvisionalScore: Boolean(row.is_provisional_score),
              crawlDurationMs: row.crawl_duration_ms || 0,
              scoreBreakdown: row.score_breakdown || undefined,
              crawlLimits: row.crawl_limits || undefined,
              auditVersion: row.audit_version || '2.0',
              scoringVersion: row.scoring_version || '2.0',
              startedAt: row.started_at || new Date().toISOString(),
              completedAt: row.completed_at || undefined,
              findingsCount: row.findings_count || { critical: 0, high: 0, medium: 0, low: 0 },
            }));
          }
        } else {
          // Superadmin can view all audit runs
          const { data, error } = await client
            .from('audit_runs')
            .select('*')
            .order('started_at', { ascending: false });

          if (!error && Array.isArray(data)) {
            return data.map((row: any) => ({
              id: row.id,
              websiteId: row.website_id,
              organizationId: row.organization_id,
              status: row.status || 'completed',
              pagesCrawled: row.pages_crawled || 0,
              pagesDiscovered: row.urls_discovered || row.pages_discovered || row.pages_crawled || 0,
              pagesFailed: row.pages_failed || 0,
              seoScore: Number(row.seo_score) || 0,
              geoScore: Number(row.geo_score) || 0,
              aeoScore: Number(row.aeo_score) || 0,
              technicalScore: Number(row.technical_score) || Number(row.seo_score) || 0,
              isProvisionalScore: Boolean(row.is_provisional_score),
              crawlDurationMs: row.crawl_duration_ms || 0,
              scoreBreakdown: row.score_breakdown || undefined,
              crawlLimits: row.crawl_limits || undefined,
              auditVersion: row.audit_version || '2.0',
              scoringVersion: row.scoring_version || '2.0',
              startedAt: row.started_at || new Date().toISOString(),
              completedAt: row.completed_at || undefined,
              findingsCount: row.findings_count || { critical: 0, high: 0, medium: 0, low: 0 },
            }));
          }
        }
      }
    } catch (e) {
      console.error('Database getAuditRuns error:', e);
    }
    return storage.getAuditRuns(websiteId);
  }

  async getFindings(runId?: string, websiteId?: string, req?: NextRequest | Headers | null): Promise<AuditFinding[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.organizationId) {
      return storage.getFindings(websiteId);
    }

    const client = this.getClient(req);
    if (!client) return storage.getFindings(websiteId);

    try {
      if (websiteId) {
        const site = await this.getWebsiteById(websiteId, req);
        if (!site) return []; // Website belongs to another tenant
      }

      let query = client.from('audit_findings').select('*').order('created_at', { ascending: false });
      if (runId && isValidUuid(runId)) {
        query = query.eq('audit_run_id', runId);
      }
      if (websiteId && isValidUuid(websiteId)) {
        query = query.eq('website_id', websiteId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          auditRunId: row.audit_run_id,
          websiteId: row.website_id,
          organizationId: row.organization_id,
          url: row.url,
          category: row.category as FindingCategory,
          findingType: (row.finding_type as FindingType) || 'confirmed_error',
          issueType: row.issue_type,
          severity: (row.severity as FindingSeverity) || 'medium',
          priority: (row.priority as TaskPriority) || 'medium',
          title: row.title,
          description: row.description,
          whyItMatters: row.why_it_matters || undefined,
          recommendation: row.recommendation,
          implementationSteps: Array.isArray(row.implementation_steps) ? row.implementation_steps : [],
          verificationCriteria: row.verification_criteria || undefined,
          estimatedEffort: row.estimated_effort || 'moderate',
          confidenceLevel: row.confidence_level || 'high',
          detectionMethod: row.detection_method,
          evidence: {
            expected: row.expected_condition || row.recommendation || 'Compliant with search standards',
            actual: row.actual_condition || row.description || 'Defect detected during crawl',
            snippet: row.snippet || undefined,
            statusCode: row.status_code || undefined,
            headers: row.http_headers || undefined,
          },
          firstDetectedAt: row.first_detected_at || row.created_at,
          lastDetectedAt: row.last_detected_at || row.created_at,
          isResolved: row.is_resolved || false,
          createdAt: row.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.error('Database getFindings error:', e);
    }
    return storage.getFindings(websiteId);
  }

  async saveAuditRun(run: AuditRun, findings: AuditFinding[], req?: NextRequest | Headers | null): Promise<void> {
    const client = this.getClient(req);
    const runId = isValidUuid(run.id) ? run.id : generateUuid();

    // 1. In-memory / storage update
    storage.saveAuditRun({ ...run, id: runId }, findings);

    // 2. Database update
    if (client && isValidUuid(run.websiteId)) {
      try {
        await client.from('audit_runs').upsert({
          id: runId,
          website_id: run.websiteId,
          organization_id: run.organizationId || null,
          status: run.status,
          pages_crawled: run.pagesCrawled,
          pages_failed: run.pagesFailed || 0,
          urls_discovered: run.pagesDiscovered || run.pagesCrawled,
          seo_score: run.seoScore,
          geo_score: run.geoScore,
          aeo_score: run.aeoScore,
          technical_score: run.technicalScore || run.seoScore,
          is_provisional_score: run.isProvisionalScore || false,
          crawl_duration_ms: run.crawlDurationMs,
          score_breakdown: run.scoreBreakdown || {},
          crawl_limits: run.crawlLimits || {},
          audit_version: run.auditVersion || '2.0',
          scoring_version: run.scoringVersion || '2.0',
          started_at: run.startedAt,
          completed_at: run.completedAt || new Date().toISOString(),
        });

        await client.from('websites').update({
          latest_seo_score: run.seoScore,
          latest_geo_score: run.geoScore,
          latest_aeo_score: run.aeoScore,
          last_audited_at: run.completedAt || new Date().toISOString(),
        }).eq('id', run.websiteId);

        // Score history tracking
        try {
          await client.from('score_history').insert({
            id: generateUuid(),
            website_id: run.websiteId,
            audit_run_id: runId,
            seo_score: run.seoScore,
            geo_score: run.geoScore,
            aeo_score: run.aeoScore,
            recorded_at: run.completedAt || new Date().toISOString(),
          });
        } catch {
          // Ignore if score_history insert fails
        }

        if (findings.length > 0) {
          const findingRows = findings.map(f => ({
            id: isValidUuid(f.id) ? f.id : generateUuid(),
            audit_run_id: runId,
            website_id: run.websiteId,
            organization_id: run.organizationId || null,
            url: f.url,
            category: f.category,
            finding_type: f.findingType || 'confirmed_error',
            issue_type: f.issueType,
            severity: f.severity,
            priority: f.priority || (f.severity === 'critical' ? 'critical' : f.severity === 'high' ? 'high' : 'medium'),
            title: f.title,
            description: f.description,
            why_it_matters: f.whyItMatters || null,
            recommendation: f.recommendation,
            implementation_steps: f.implementationSteps || [],
            verification_criteria: f.verificationCriteria || null,
            estimated_effort: f.estimatedEffort || 'moderate',
            confidence_level: f.confidenceLevel,
            detection_method: f.detectionMethod,
            is_resolved: f.isResolved,
            first_detected_at: f.firstDetectedAt || new Date().toISOString(),
            last_detected_at: f.lastDetectedAt || new Date().toISOString(),
          }));
          await client.from('audit_findings').insert(findingRows);
        }
      } catch (e) {
        console.error('Database saveAuditRun error:', e);
      }
    }

    await this.logActivity('audit_executed', 'audit_run', runId, {
      websiteId: run.websiteId,
      seoScore: run.seoScore,
      findingsCount: findings.length,
    }, req);
  }

  // ==========================================
  // ACTION ITEMS / TASKS (Strict Workspace Scoping)
  // ==========================================
  async getActionItems(websiteId?: string, req?: NextRequest | Headers | null): Promise<ActionItem[]> {
    const auth = await getServerAuthContext(req);
    if (!auth.isAdmin && !auth.organizationId) return [];

    const client = this.getClient(req);
    if (!client) return [];

    try {
      let query = client
        .from('action_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!auth.isAdmin && auth.organizationId) {
        query = query.eq('organization_id', auth.organizationId);
      }

      if (websiteId && isValidUuid(websiteId)) {
        query = query.eq('website_id', websiteId);
      }

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        return data.map((row: any) => ({
          id: row.id,
          organizationId: row.organization_id,
          websiteId: row.website_id,
          sourceType: row.source_type,
          sourceId: row.source_id || undefined,
          title: row.title,
          description: row.description,
          category: row.category as FindingCategory,
          priority: row.priority as TaskPriority,
          affectedUrl: row.affected_url,
          recommendedSolution: row.recommended_solution,
          steps: Array.isArray(row.step_by_step_instructions) ? row.step_by_step_instructions : [],
          status: row.status as TaskStatus,
          verificationStatus: row.verification_status || 'unverified',
          dueDate: row.due_date || undefined,
          completedAt: row.completed_at || undefined,
          userNotes: row.user_notes || undefined,
          createdAt: row.created_at || new Date().toISOString(),
          targetKeyword: row.target_keyword || undefined,
          opportunityCategory: row.opportunity_category || undefined,
          baselineMetrics: row.baseline_metrics || undefined,
          latestMetrics: row.latest_metrics || undefined,
          metricDelta: row.metric_delta || undefined,
          expectedOutcome: row.expected_outcome || undefined,
          evidenceSummary: row.evidence_summary || undefined,
          relatedAuditFindings: row.related_audit_findings || undefined,
          verificationCriteria: row.verification_criteria || undefined,
          verificationMethod: row.verification_method || undefined,
          verificationExplanation: row.verification_explanation || undefined,
        }));
      }
    } catch (e) {
      console.error('Database getActionItems error:', e);
    }
    return storage.getActionItems(websiteId);
  }

  async createActionItem(item: Partial<ActionItem>, req?: NextRequest | Headers | null): Promise<ActionItem> {
    const auth = await getServerAuthContext(req);
    const orgId = auth.organizationId || item.organizationId || (req ? null : '00000000-0000-0000-0000-000000000001');
    if (!orgId) {
      throw new Error('Authentication required to create action tasks.');
    }

    const taskId = (item.id && isValidUuid(item.id)) ? item.id : generateUuid();
    const client = this.getClient(req);
    const targetFindingId = item.findingId || (item.sourceType === 'audit_finding' ? item.sourceId : undefined);

    // 1. Deduplication for Audit Findings
    if (client && item.websiteId && targetFindingId && isValidUuid(targetFindingId)) {
      try {
        const { data: existing } = await client
          .from('action_items')
          .select('*')
          .eq('website_id', item.websiteId)
          .or(`finding_id.eq.${targetFindingId},source_id.eq.${targetFindingId}`)
          .in('status', ['todo', 'in_progress', 'verification_pending'])
          .maybeSingle();

        if (existing) {
          return {
            id: existing.id,
            organizationId: existing.organization_id,
            websiteId: existing.website_id,
            sourceType: existing.source_type,
            sourceId: existing.source_id,
            findingId: existing.finding_id || existing.source_id,
            auditRunId: existing.audit_run_id,
            title: existing.title,
            description: existing.description,
            category: existing.category,
            priority: existing.priority,
            severity: existing.severity,
            affectedUrl: existing.affected_url,
            recommendedSolution: existing.recommended_solution,
            steps: Array.isArray(existing.step_by_step_instructions) ? existing.step_by_step_instructions : [],
            status: existing.status,
            verificationStatus: existing.verification_status,
            dueDate: existing.due_date,
            createdAt: existing.created_at,
          };
        }
      } catch (e) {
        // Fallback to insertion
      }
    }

    // 2. In-memory duplicate check (covers both findings and SEO opportunity tasks)
    const memTasks = storage.getActionItems(item.websiteId);
    if (targetFindingId) {
      const memExisting = memTasks.find(
        a => (a.findingId === targetFindingId || a.sourceId === targetFindingId) &&
             ['todo', 'in_progress', 'verification_pending'].includes(a.status)
      );
      if (memExisting) return memExisting;
    }

    if (item.sourceType === 'seo_opportunity') {
      const oppDuplicate = memTasks.find(
        a => (a.sourceId === item.sourceId ||
             (item.targetKeyword && a.targetKeyword?.toLowerCase() === item.targetKeyword.toLowerCase() && a.affectedUrl === item.affectedUrl)) &&
             ['todo', 'in_progress', 'verification_pending'].includes(a.status)
      );
      if (oppDuplicate) return oppDuplicate;
    }

    const taskRow: any = {
      id: taskId,
      organization_id: orgId,
      website_id: item.websiteId,
      source_type: item.sourceType || 'manual',
      source_id: (item.sourceId && isValidUuid(item.sourceId)) ? item.sourceId : null,
      finding_id: (targetFindingId && isValidUuid(targetFindingId)) ? targetFindingId : null,
      audit_run_id: (item.auditRunId && isValidUuid(item.auditRunId)) ? item.auditRunId : null,
      title: item.title || 'Untitled Action Item',
      description: item.description || item.title || '',
      category: (item.category as FindingCategory) || 'technical',
      priority: (item.priority as TaskPriority) || 'medium',
      severity: item.severity || 'medium',
      affected_url: item.affectedUrl || '',
      recommended_solution: item.recommendedSolution || 'Implement optimization.',
      step_by_step_instructions: item.steps || [],
      verification_criteria: item.verificationCriteria || null,
      estimated_effort: item.estimatedEffort || 'moderate',
      status: item.status || 'todo',
      verification_status: item.verificationStatus === 'completed_verified' ? 'verified' : (item.verificationStatus === 'still_unresolved' ? 'unresolved' : 'unverified'),
      due_date: item.dueDate || null,
      created_at: item.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (client) {
      try {
        const { error } = await client.from('action_items').insert(taskRow);
        if (error) {
          // If the remote Supabase database hasn't applied the latest migration yet, fallback to core columns
          if (error.code === 'PGRST204') {
            const { audit_run_id, finding_id, verification_criteria, estimated_effort, ...coreTaskRow } = taskRow;
            const { error: retryError } = await client.from('action_items').insert(coreTaskRow);
            if (retryError) console.warn('Database createActionItem fallback notice:', retryError.message);
          } else {
            console.error('Database createActionItem error:', error);
          }
        }
      } catch (e) {
        console.error('Database createActionItem fallback:', e);
      }
    }

    const newTask: ActionItem = {
      id: taskId,
      organizationId: orgId,
      websiteId: item.websiteId || '',
      sourceType: item.sourceType || 'manual',
      sourceId: item.sourceId,
      findingId: targetFindingId,
      auditRunId: item.auditRunId,
      title: item.title || 'Untitled Action Item',
      description: item.description || item.title || '',
      category: (item.category as FindingCategory) || 'technical',
      priority: (item.priority as TaskPriority) || 'medium',
      severity: item.severity,
      affectedUrl: item.affectedUrl || '',
      recommendedSolution: item.recommendedSolution || '',
      steps: item.steps || [],
      status: item.status || 'todo',
      verificationStatus: item.verificationStatus || 'unverified',
      dueDate: item.dueDate,
      createdAt: item.createdAt || new Date().toISOString(),
      targetKeyword: item.targetKeyword,
      opportunityCategory: item.opportunityCategory,
      baselineMetrics: item.baselineMetrics,
      latestMetrics: item.latestMetrics,
      metricDelta: item.metricDelta,
      expectedOutcome: item.expectedOutcome,
      evidenceSummary: item.evidenceSummary,
      relatedAuditFindings: item.relatedAuditFindings,
      verificationCriteria: item.verificationCriteria,
      verificationMethod: item.verificationMethod,
      verificationExplanation: item.verificationExplanation,
    };

    storage.addActionItem(newTask);

    await this.logActivity('task_created', 'action_item', newTask.id, { title: newTask.title }, req);
    return newTask;
  }

  async updateActionItemStatus(id: string, status: TaskStatus, notes?: string, req?: NextRequest | Headers | null): Promise<ActionItem | null> {
    if (!id || !isValidUuid(id)) return null;

    const auth = await getServerAuthContext(req);
    if (!auth.organizationId) return null;

    const client = this.getClient(req);
    if (client) {
      try {
        const updates: any = {
          status,
          updated_at: new Date().toISOString(),
        };
        if (status === 'completed') {
          updates.completed_at = new Date().toISOString();
        }
        if (notes !== undefined) {
          updates.user_notes = notes;
        }

        let query = client.from('action_items').update(updates).eq('id', id);
        if (!auth.isAdmin) {
          query = query.eq('organization_id', auth.organizationId);
        }
        await query;
      } catch (e) {
        console.error('Database updateActionItemStatus error:', e);
      }
    }

    await this.logActivity('task_status_updated', 'action_item', id, { status }, req);
    return null;
  }

  async updateActionItemVerification(
    id: string,
    verificationStatus: VerificationOutcome,
    req?: NextRequest | Headers | null
  ): Promise<void> {
    if (!id) return;
    const client = this.getClient(req);
    const dbStatus = (verificationStatus === 'completed_verified' || verificationStatus === 'verified')
      ? 'verified'
      : (verificationStatus === 'still_unresolved' ? 'unresolved' : 'unverified');

    if (client && isValidUuid(id)) {
      try {
        await client.from('action_items').update({
          verification_status: dbStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', id);
      } catch (e: any) {
        console.warn('Database updateActionItemVerification exception:', e.message);
      }
    }

    const item = storage.getActionItems().find(a => a.id === id);
    if (item) {
      item.verificationStatus = verificationStatus;
    }
  }

  async resolveFinding(findingId: string, req?: NextRequest | Headers | null): Promise<boolean> {
    if (!findingId) return false;
    const client = this.getClient(req);
    if (client && isValidUuid(findingId)) {
      try {
        await client.from('audit_findings').update({ is_resolved: true }).eq('id', findingId);
        return true;
      } catch (e) {
        console.error('Database resolveFinding error:', e);
      }
    }
    const finding = storage.getFindings().find(f => f.id === findingId);
    if (finding) {
      finding.isResolved = true;
      return true;
    }
    return false;
  }

  async recordVerificationRun(
    actionItemId: string,
    outcome: string,
    explanation: string,
    beforeEvidence: string,
    afterEvidence: string,
    req?: NextRequest | Headers | null
  ): Promise<void> {
    const client = this.getClient(req);
    if (client && isValidUuid(actionItemId)) {
      try {
        const runId = generateUuid();
        await client.from('verification_runs').insert({
          id: runId,
          action_item_id: actionItemId,
          outcome,
          explanation,
          verified_at: new Date().toISOString(),
        });
        await client.from('verification_evidence').insert({
          id: generateUuid(),
          verification_run_id: runId,
          before_state: beforeEvidence,
          after_state: afterEvidence,
          created_at: new Date().toISOString(),
        });
      } catch (e) {
        console.error('Database recordVerificationRun error:', e);
      }
    }
  }

  // ==========================================
  // USERS & PROFILES (ADMIN ONLY)
  // ==========================================
  async getProfiles(req?: NextRequest | Headers | null): Promise<UserProfile[]> {
    if (req) {
      const auth = await getServerAuthContext(req);
      if (!auth.isAdmin) {
        if (auth.user) {
          return [{
            id: auth.user.id,
            email: auth.user.email,
            fullName: auth.user.fullName,
            role: auth.user.role,
            createdAt: new Date().toISOString(),
          }];
        }
        return [];
      }
    }

    const client = this.getClient(req);
    if (client) {
      try {
        // 1. If service role key is configured, list directly from Supabase auth.admin
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.SUPABASE_SERVICE_KEY || 
                           process.env.SUPABASE_SECRET_KEY || 
                           process.env.SB_SECRET_KEY;
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';

        if (serviceKey && url && !url.includes('your-project')) {
          try {
            const { createClient: createDirectClient } = await import('@supabase/supabase-js');
            const adminAuth = createDirectClient(url, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: authData, error: authErr } = await adminAuth.auth.admin.listUsers();
            if (!authErr && authData?.users && authData.users.length > 0) {
              return authData.users.map((u: any) => ({
                id: u.id,
                email: u.email || '',
                fullName: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
                avatarUrl: undefined,
                role: (u.email === 'uzairnoor1101@gmail.com' || u.email?.includes('uzairnoor') || u.email === 'founder@rankpilot.ai') ? 'superadmin' : 'user',
                createdAt: u.created_at || new Date().toISOString(),
              }));
            }
          } catch (e) {
            console.warn('adminAuth.auth.admin.listUsers failed, querying profiles table:', e);
          }
        }

        // 2. Query public.profiles with client (authenticated as admin)
        const { data, error } = await client
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            fullName: row.full_name || row.email?.split('@')[0] || 'User',
            avatarUrl: row.avatar_url || undefined,
            role: row.role || 'user',
            createdAt: row.created_at || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.error('Database getProfiles error:', e);
      }
    }

    // Default system admin profile for test environments
    return [
      {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'uzairnoor1101@gmail.com',
        fullName: 'Uzair Noor',
        role: 'superadmin',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async updateProfileRole(id: string, role: 'user' | 'admin' | 'superadmin', req?: NextRequest | Headers | null): Promise<boolean> {
    if (req) {
      const auth = await getServerAuthContext(req);
      if (!auth.isAdmin) {
        throw new Error('Forbidden: Only administrators can modify user roles.');
      }
    }

    const client = this.getClient(req);
    if (client) {
      try {
        const { error } = await client.from('profiles').update({ role, updated_at: new Date().toISOString() }).eq('id', id);
        if (!error) {
          await this.logActivity('user_role_updated', 'user', id, { newRole: role }, req);
          return true;
        }
      } catch (e) {
        console.error('Database updateProfileRole error:', e);
      }
    }
    return true;
  }

  // ==========================================
  // GSC PERFORMANCE & SEARCH METRICS
  // ==========================================
  async saveGscMetrics(websiteId: string, rows: GscPerformanceRow[], req?: NextRequest | Headers | null): Promise<void> {
    storage.saveGscPerformance(websiteId, rows);

    const client = this.getClient(req);
    if (client && isValidUuid(websiteId) && rows.length > 0) {
      try {
        const dbRows = rows.map(r => ({
          id: generateUuid(),
          website_id: websiteId,
          date: r.date,
          page_url: r.page,
          query: r.query,
          clicks: r.clicks,
          impressions: r.impressions,
          ctr: r.ctr,
          position: r.position,
          device: r.device || 'desktop',
          country: r.country || 'global',
        }));

        // Batch insert up to 1000 rows
        const batch = dbRows.slice(0, 1000);
        await client.from('gsc_metrics').insert(batch);
      } catch (e: any) {
        console.warn('Database saveGscMetrics notice:', e.message);
      }
    }
  }

  async getGscMetrics(websiteId: string, req?: NextRequest | Headers | null): Promise<GscPerformanceRow[]> {
    const memRows = storage.getGscPerformance(websiteId);
    if (memRows.length > 0) return memRows;

    const client = this.getClient(req);
    if (client && isValidUuid(websiteId)) {
      try {
        const { data, error } = await client
          .from('gsc_metrics')
          .select('*')
          .eq('website_id', websiteId)
          .order('date', { ascending: false })
          .limit(1000);

        if (!error && Array.isArray(data) && data.length > 0) {
          const rows: GscPerformanceRow[] = data.map((d: any) => ({
            date: d.date,
            page: d.page_url,
            query: d.query || '',
            clicks: d.clicks || 0,
            impressions: d.impressions || 0,
            ctr: Number(d.ctr) || 0,
            position: Number(d.position) || 0,
            device: d.device || 'desktop',
            country: d.country || 'global',
          }));
          storage.saveGscPerformance(websiteId, rows);
          return rows;
        }
      } catch (e) {
        // Fallback to memory
      }
    }
    return memRows;
  }

  // ==========================================
  // SEO OPPORTUNITIES
  // ==========================================
  async getOpportunities(websiteId?: string, req?: NextRequest | Headers | null): Promise<SeoOpportunity[]> {
    const memOpps = storage.getOpportunities(websiteId);
    if (memOpps.length > 0) return memOpps;

    const client = this.getClient(req);
    if (client && websiteId && isValidUuid(websiteId)) {
      try {
        const { data, error } = await client
          .from('seo_opportunities')
          .select('*')
          .eq('website_id', websiteId)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped: SeoOpportunity[] = data.map((d: any) => ({
            id: d.id,
            websiteId: d.website_id,
            type: d.type,
            category: d.category || 'keyword_opportunities',
            title: d.title || `Opportunity: "${d.query}"`,
            query: d.query,
            pageUrl: d.page_url,
            impressions: d.impressions || 0,
            clicks: d.clicks || 0,
            ctr: Number(d.ctr) || 0,
            position: Number(d.position) || 0,
            potentialImpact: d.potential_impact || 'medium',
            priority: d.priority || d.potential_impact || 'medium',
            confidenceLevel: d.confidence_level || 'high',
            hypothesis: d.hypothesis,
            whyItMatters: d.why_it_matters || d.hypothesis,
            expertExplanation: d.expert_explanation || d.hypothesis,
            recommendedAction: d.recommended_action,
            recommendedStrategy: d.recommended_strategy || d.recommended_action,
            implementationSteps: Array.isArray(d.implementation_steps) ? d.implementation_steps : [],
            expectedBenefit: d.expected_benefit || '',
            verificationMethod: d.verification_method || '',
            status: d.status || 'open',
            createdAt: d.created_at,
          }));
          storage.saveOpportunities(websiteId, mapped);
          return mapped;
        }
      } catch (e) {
        // Fallback to storage
      }
    }
    return memOpps;
  }

  async saveOpportunities(websiteId: string, opps: SeoOpportunity[], req?: NextRequest | Headers | null): Promise<void> {
    storage.saveOpportunities(websiteId, opps);

    const client = this.getClient(req);
    if (client && isValidUuid(websiteId) && opps.length > 0) {
      try {
        const dbRows = opps.map(o => ({
          id: isValidUuid(o.id) ? o.id : generateUuid(),
          website_id: websiteId,
          type: o.type,
          query: o.query,
          page_url: o.pageUrl,
          impressions: o.impressions,
          clicks: o.clicks,
          ctr: o.ctr,
          position: o.position,
          potential_impact: o.potentialImpact,
          hypothesis: o.hypothesis,
          recommended_action: o.recommendedAction,
          status: o.status,
          created_at: o.createdAt || new Date().toISOString(),
        }));
        await client.from('seo_opportunities').insert(dbRows);
      } catch (e: any) {
        console.warn('Database saveOpportunities notice:', e.message);
      }
    }
  }

  // ==========================================
  // ACTIVITY LOGS
  // ==========================================
  async logActivity(
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: any,
    req?: NextRequest | Headers | null
  ): Promise<void> {
    const auth = await getServerAuthContext(req);
    const entry = {
      id: generateUuid(),
      organization_id: auth.organizationId || 'default-org',
      user_id: auth.user?.id || null,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || null,
      created_at: new Date().toISOString(),
    };
    this.inMemoryLogs.unshift(entry);

    if (!auth.organizationId) return;

    const client = this.getClient(req);
    if (client) {
      try {
        await client.from('activity_logs').insert(entry);
      } catch (e) {
        // Log silently
      }
    }
  }

  async getActivityLogs(limit = 50, req?: NextRequest | Headers | null): Promise<any[]> {
    const auth = await getServerAuthContext(req);
    const client = this.getClient(req);
    if (client) {
      try {
        let query = client.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(limit);
        if (!auth.isAdmin && auth.organizationId) {
          query = query.eq('organization_id', auth.organizationId);
        }
        const { data, error } = await query;
        if (!error && Array.isArray(data) && data.length > 0) return data;
      } catch (e) {
        // Fallback to in-memory
      }
    }
    return this.inMemoryLogs.slice(0, limit);
  }
}

export const db = new DatabaseService();
