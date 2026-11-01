import {
  Website,
  AuditFinding,
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
  mockActionItems,
  mockOpportunities,
  mockNotifications,
  mockReports,
  mockUser,
  mockOrganization
} from './mock-data';

// In-Memory state for local sessions
class StorageService {
  private websites: Website[] = [...mockWebsites];
  private findings: AuditFinding[] = [...mockFindings];
  private actionItems: ActionItem[] = [...mockActionItems];
  private opportunities: SeoOpportunity[] = [...mockOpportunities];
  private notifications: AppNotification[] = [...mockNotifications];
  private reports: ClientReport[] = [...mockReports];
  private currentUser: UserProfile = { ...mockUser };
  private currentOrg: Organization = { ...mockOrganization };

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

  addWebsite(data: { name: string; domain: string; url: string }): Website {
    const newWebsite: Website = {
      id: `web-${Date.now()}`,
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
    this.websites.unshift(newWebsite);
    return newWebsite;
  }

  deleteWebsite(id: string): boolean {
    const initialLen = this.websites.length;
    this.websites = this.websites.filter(w => w.id !== id);
    this.findings = this.findings.filter(f => f.websiteId !== id);
    this.actionItems = this.actionItems.filter(a => a.websiteId !== id);
    return this.websites.length < initialLen;
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

  // Action Items
  getActionItems(websiteId?: string): ActionItem[] {
    if (websiteId) {
      return this.actionItems.filter(a => a.websiteId === websiteId);
    }
    return this.actionItems;
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
