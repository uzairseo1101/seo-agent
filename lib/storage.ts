import {
  Website,
  AuditFinding,
  AuditRun,
  ActionItem,
  SeoOpportunity,
  AppNotification,
  ClientReport,
  UserProfile,
  Organization
} from './types';
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

// In-Memory state for local sessions with optional localStorage browser caching
class StorageService {
  private websites: Website[] = [...mockWebsites];
  private auditRuns: AuditRun[] = [...mockAuditRuns];
  private findings: AuditFinding[] = [...mockFindings];
  private actionItems: ActionItem[] = [...mockActionItems];
  private opportunities: SeoOpportunity[] = [...mockOpportunities];
  private notifications: AppNotification[] = [...mockNotifications];
  private reports: ClientReport[] = [...mockReports];
  private currentUser: UserProfile = { ...mockUser };
  private currentOrg: Organization = { ...mockOrganization };

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedWebsites = localStorage.getItem('rp_websites');
        if (storedWebsites) {
          const parsed = JSON.parse(storedWebsites);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.websites = parsed;
          }
        }
        const storedTasks = localStorage.getItem('rp_tasks');
        if (storedTasks) {
          const parsed = JSON.parse(storedTasks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.actionItems = parsed;
          }
        }
      } catch (e) {
        // Silently ignore storage hydration errors
      }
    }
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
    const generatedId = data.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}`);
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

  // Findings
  getFindings(websiteId?: string): AuditFinding[] {
    if (websiteId) {
      return this.findings.filter(f => f.websiteId === websiteId);
    }
    return this.findings;
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

    const existing = this.actionItems.find(a => a.sourceId === oppId);
    if (existing) return existing;

    const newTask: ActionItem = {
      id: `act-opp-${Date.now()}`,
      organizationId: this.currentOrg.id,
      websiteId: opp.websiteId,
      sourceType: 'seo_opportunity',
      sourceId: opp.id,
      title: `Optimize: "${opp.query}"`,
      description: opp.hypothesis,
      category: 'content',
      priority: opp.potentialImpact === 'critical' ? 'critical' : opp.potentialImpact === 'high' ? 'high' : 'medium',
      affectedUrl: opp.pageUrl,
      recommendedSolution: opp.recommendedAction,
      steps: [
        `Review SERP snippet ranking for query: "${opp.query}"`,
        `Update title and meta description on ${opp.pageUrl} to align with search intent`,
        `Add contextual internal link anchors from related blog or category articles`,
        `Request re-indexing via Google Search Console`,
      ],
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
      id: `act-${Date.now()}`,
      organizationId: this.currentOrg.id,
      websiteId: finding.websiteId,
      sourceType: 'audit_finding',
      sourceId: finding.id,
      title: `Fix: ${finding.title}`,
      description: finding.description,
      category: finding.category,
      priority: finding.severity === 'critical' ? 'critical' : finding.severity === 'high' ? 'high' : 'medium',
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
}

// Global singleton for the session
export const storage = new StorageService();
