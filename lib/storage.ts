import {
  Website,
  AuditFinding,
  AuditRun,
  ActionItem,
  SeoOpportunity,
  AppNotification,
  ClientReport,
  UserProfile,
  Organization,
  CrawlJob
} from './types';
import { GscPerformanceRow } from './gsc/types';
import { generateUuid } from './utils';
import {
  mockWebsites,
  mockFindings,
  mockAuditRuns,
  mockActionItems,
  mockOpportunities,
  mockNotifications,
  mockReports,
  mockUser,
  mockOrganization
} from './mock-data';

// In-Memory state for local sessions (initialized cleanly without shared fixtures)
class StorageService {
  private websites: Website[] = [];
  private auditRuns: AuditRun[] = [];
  private findings: AuditFinding[] = [];
  private actionItems: ActionItem[] = [];
  private opportunities: SeoOpportunity[] = [];
  private notifications: AppNotification[] = [];
  private reports: ClientReport[] = [];
  private crawlJobs: CrawlJob[] = [];
  private gscPerformance: Map<string, GscPerformanceRow[]> = new Map();
  private currentUser: UserProfile = {
    id: '',
    email: '',
    fullName: 'User',
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  private currentOrg: Organization = {
    id: '',
    name: 'Workspace',
    slug: 'workspace',
    plan: 'free',
    maxWebsites: 1,
    maxCrawledPagesPerAudit: 10,
    maxAiAnalysesPerMonth: 50,
    createdAt: new Date().toISOString(),
  };

  constructor() {
    // Clean empty initialization - zero hardcoded cross-user leakage
  }

  private persist(key: string, data: any) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        // Silently ignore storage write errors
      }
    }
  }

  // Profile & Org
  getUser(): UserProfile {
    return this.currentUser;
  }

  getOrganization(): Organization {
    return this.currentOrg;
  }

  updateOrganizationName(name: string): Organization {
    this.currentOrg.name = name;
    return this.currentOrg;
  }

  // Websites
  getWebsites(): Website[] {
    return this.websites;
  }

  getWebsiteById(id: string): Website | undefined {
    return this.websites.find(w => w.id === id);
  }

  addWebsite(data: { name: string; domain: string; url: string; id?: string }): Website {
    const generatedId = data.id || generateUuid();
    const existingIndex = this.websites.findIndex(w => w.id === generatedId);
    
    const newWebsite: Website = {
      id: generatedId,
      organizationId: this.currentOrg.id,
      name: data.name,
      domain: data.domain.replace(/^https?:\/\//i, '').replace(/\/.*$/, ''),
      url: data.url.startsWith('http') ? data.url : `https://${data.url}`,
      status: 'active',
      latestSeoScore: 0,
      latestGeoScore: 0,
      latestAeoScore: 0,
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.websites[existingIndex] = newWebsite;
    } else {
      this.websites.unshift(newWebsite);
    }

    this.persist('rp_websites', this.websites);
    return newWebsite;
  }

  deleteWebsite(id: string): boolean {
    const initialLen = this.websites.length;
    this.websites = this.websites.filter(w => w.id !== id);
    this.findings = this.findings.filter(f => f.websiteId !== id);
    this.actionItems = this.actionItems.filter(a => a.websiteId !== id);
    this.persist('rp_websites', this.websites);
    this.persist('rp_tasks', this.actionItems);
    return this.websites.length < initialLen;
  }

  // Audit Runs
  getAuditRuns(websiteId?: string): AuditRun[] {
    if (websiteId) {
      return this.auditRuns.filter(r => r.websiteId === websiteId);
    }
    return this.auditRuns;
  }

  saveAuditRun(run: AuditRun, newFindings: AuditFinding[]): void {
    this.auditRuns.unshift(run);

    // Replace or prepend findings for this website
    this.findings = [...newFindings, ...this.findings.filter(f => f.websiteId !== run.websiteId)];

    // Update website latest scores and audited date
    const targetSite = this.websites.find(w => w.id === run.websiteId);
    if (targetSite) {
      targetSite.latestSeoScore = run.seoScore;
      targetSite.latestGeoScore = run.geoScore;
      targetSite.latestAeoScore = run.aeoScore;
      targetSite.lastAuditedAt = run.completedAt || new Date().toISOString();
    }
  }

  // Crawl Jobs
  getCrawlJobById(id: string): CrawlJob | undefined {
    return this.crawlJobs.find(j => j.id === id);
  }

  getLatestCrawlJob(websiteId: string): CrawlJob | undefined {
    return this.crawlJobs.find(j => j.websiteId === websiteId);
  }

  saveCrawlJob(job: CrawlJob): CrawlJob {
    const existingIndex = this.crawlJobs.findIndex(j => j.id === job.id);
    if (existingIndex >= 0) {
      this.crawlJobs[existingIndex] = { ...this.crawlJobs[existingIndex], ...job, updatedAt: new Date().toISOString() };
      return this.crawlJobs[existingIndex];
    } else {
      this.crawlJobs.unshift(job);
      return job;
    }
  }

  updateCrawlJob(id: string, updates: Partial<CrawlJob>): CrawlJob | undefined {
    const job = this.crawlJobs.find(j => j.id === id);
    if (job) {
      Object.assign(job, updates, { updatedAt: new Date().toISOString() });
      return job;
    }
    return undefined;
  }

  // Findings
  getFindings(websiteId?: string): AuditFinding[] {
    if (websiteId) {
      return this.findings.filter(f => f.websiteId === websiteId);
    }
    return this.findings;
  }

  // GSC Performance Data
  getGscPerformance(websiteId: string): GscPerformanceRow[] {
    return this.gscPerformance.get(websiteId) || [];
  }

  saveGscPerformance(websiteId: string, rows: GscPerformanceRow[]): void {
    this.gscPerformance.set(websiteId, rows);
  }

  // Opportunities
  getOpportunities(websiteId?: string): SeoOpportunity[] {
    if (websiteId) {
      return this.opportunities.filter(o => o.websiteId === websiteId);
    }
    return this.opportunities;
  }

  saveOpportunities(websiteId: string, newOpps: SeoOpportunity[]): void {
    // Replace opportunities for this website with latest findings
    this.opportunities = [
      ...newOpps,
      ...this.opportunities.filter(o => o.websiteId !== websiteId),
    ];
  }

  createActionItemFromOpportunity(oppId: string): ActionItem | null {
    const opp = this.opportunities.find(o => o.id === oppId);
    if (!opp) return null;

    // Check duplicate by sourceId or by website + targetKeyword + affectedUrl
    const existing = this.actionItems.find(a => 
      a.sourceId === oppId || 
      (a.websiteId === opp.websiteId && a.targetKeyword?.toLowerCase() === opp.query.toLowerCase() && a.affectedUrl === opp.pageUrl && ['todo', 'in_progress', 'verification_pending'].includes(a.status))
    );
    if (existing) return existing;

    // Map opportunity category to Action Item category constraint ('technical' | 'content' | 'geo' | 'aeo' | 'indexability')
    let taskCategory: ActionItem['category'] = 'content';
    if (opp.category === 'technical_seo') taskCategory = 'technical';
    else if (opp.category === 'internal_linking') taskCategory = 'technical';
    else if (opp.category === 'geo_aeo') taskCategory = 'geo';
    else if (opp.category === 'ai_overviews') taskCategory = 'aeo';

    const defaultSteps = [
      `Review SERP snippet ranking for query: "${opp.query}"`,
      `Update title and meta description on ${opp.pageUrl} to align with search intent`,
      `Add contextual internal link anchors from related blog or category articles`,
      `Request re-indexing via Google Search Console`,
    ];

    const newTask: ActionItem = {
      id: generateUuid(),
      organizationId: this.currentOrg.id,
      websiteId: opp.websiteId,
      sourceType: 'seo_opportunity',
      sourceId: opp.id,
      title: opp.title || `Optimize: "${opp.query}"`,
      description: opp.hypothesis,
      category: taskCategory,
      priority: opp.priority || (opp.potentialImpact === 'critical' ? 'critical' : opp.potentialImpact === 'high' ? 'high' : 'medium'),
      affectedUrl: opp.pageUrl,
      recommendedSolution: opp.recommendedAction,
      steps: opp.implementationSteps && opp.implementationSteps.length > 0 ? opp.implementationSteps : defaultSteps,
      targetKeyword: opp.query,
      opportunityCategory: opp.category || opp.type,
      baselineMetrics: {
        clicks: opp.clicks,
        impressions: opp.impressions,
        ctr: opp.ctr,
        position: opp.position,
        date: new Date().toISOString(),
      },
      expectedOutcome: opp.expectedBenefit || 'Improve organic click capture and search visibility.',
      evidenceSummary: opp.hypothesis,
      relatedAuditFindings: opp.evidence?.auditFindings || [],
      verificationCriteria: opp.verificationMethod || `Verify improved GSC clicks and CTR for "${opp.query}" post-optimization.`,
      verificationMethod: opp.verificationMethod,
      status: 'todo',
      verificationStatus: 'unverified',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    this.actionItems.unshift(newTask);
    return newTask;
  }

  // Action Items
  getActionItems(websiteId?: string): ActionItem[] {
    if (websiteId) {
      return this.actionItems.filter(a => a.websiteId === websiteId);
    }
    return this.actionItems;
  }

  addActionItem(item: ActionItem): ActionItem {
    this.actionItems.unshift(item);
    return item;
  }

  createActionItemFromFinding(findingId: string): ActionItem | null {
    const finding = this.findings.find(f => f.id === findingId);
    if (!finding) return null;

    // Check if task already exists
    const existing = this.actionItems.find(a => a.sourceId === findingId);
    if (existing) return existing;

    const newTask: ActionItem = {
      id: generateUuid(),
      organizationId: this.currentOrg.id,
      websiteId: finding.websiteId,
      sourceType: 'audit_finding',
      sourceId: finding.id,
      findingId: finding.id,
      auditRunId: finding.auditRunId,
      title: `Fix: ${finding.title}`,
      description: finding.description,
      category: finding.category,
      priority: finding.severity === 'critical' ? 'critical' : finding.severity === 'high' ? 'high' : 'medium',
      severity: finding.severity,
      affectedUrl: finding.url,
      recommendedSolution: finding.recommendation,
      steps: [
        'Review current page source at the affected URL',
        'Implement the recommended fix',
        'Deploy changes to production',
        'Mark task completed to schedule verification crawl',
      ],
      status: 'todo',
      verificationStatus: 'unverified',
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    this.actionItems.unshift(newTask);
    return newTask;
  }

  updateActionItemStatus(id: string, status: ActionItem['status']): ActionItem | undefined {
    const item = this.actionItems.find(a => a.id === id);
    if (item) {
      item.status = status;
      if (status === 'completed') {
        item.completedAt = new Date().toISOString();
      }
    }
    return item;
  }

  // Notifications
  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  addNotification(notif: AppNotification): void {
    this.notifications.unshift(notif);
  }

  markNotificationAsRead(id: string): void {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
  }

  markAllNotificationsAsRead(): void {
    this.notifications.forEach(n => (n.isRead = true));
  }

  // Reports
  getReports(): ClientReport[] {
    return this.reports;
  }

  addReport(report: ClientReport): ClientReport {
    this.reports.unshift(report);
    return report;
  }
}

// Global singleton for the session
export const storage = new StorageService();
