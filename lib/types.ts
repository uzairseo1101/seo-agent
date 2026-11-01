// RankPilot AI Master TypeScript Definitions

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'solo' | 'agency' | 'enterprise';
  billingEmail?: string;
  maxWebsites: number;
  maxCrawledPagesPerAudit: number;
  maxAiAnalysesPerMonth: number;
  createdAt: string;
}

export interface Website {
  id: string;
  organizationId: string;
  name: string;
  domain: string;
  url: string;
  status: 'active' | 'paused' | 'archived';
  latestSeoScore: number;
  latestGeoScore: number;
  latestAeoScore: number;
  lastAuditedAt?: string;
  createdAt: string;
}

export type FindingCategory = 'technical' | 'content' | 'geo' | 'aeo' | 'indexability';
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface AuditFinding {
  id: string;
  auditRunId: string;
  websiteId: string;
  url: string;
  category: FindingCategory;
  issueType: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  recommendation: string;
  confidenceLevel: ConfidenceLevel;
  detectionMethod: string;
  evidence: {
    expected: string;
    actual: string;
    snippet?: string;
    statusCode?: number;
  };
  isResolved: boolean;
  createdAt: string;
}

export interface AuditRun {
  id: string;
  websiteId: string;
  status: 'pending' | 'crawling' | 'analyzing' | 'completed' | 'failed';
  pagesCrawled: number;
  seoScore: number;
  geoScore: number;
  aeoScore: number;
  crawlDurationMs: number;
  startedAt: string;
  completedAt?: string;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface GscMetric {
  id: string;
  websiteId: string;
  date: string;
  pageUrl: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  device?: string;
  country?: string;
}

export interface SeoOpportunity {
  id: string;
  websiteId: string;
  type: 'high_impressions_low_ctr' | 'striking_distance_5_20' | 'declining_ctr' | 'content_expansion';
  query: string;
  pageUrl: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  potentialImpact: 'critical' | 'high' | 'medium' | 'low';
  hypothesis: string;
  recommendedAction: string;
  status: 'open' | 'actioned' | 'dismissed';
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'dismissed';
export type VerificationOutcome = 'unverified' | 'completed_verified' | 'completed_not_verified' | 'still_unresolved' | 'unable_to_verify';

export interface ActionItem {
  id: string;
  organizationId: string;
  websiteId: string;
  sourceType: 'audit_finding' | 'seo_opportunity' | 'traffic_investigation' | 'manual';
  sourceId?: string;
  title: string;
  description: string;
  category: FindingCategory;
  priority: TaskPriority;
  affectedUrl: string;
  recommendedSolution: string;
  steps: string[];
  status: TaskStatus;
  verificationStatus: VerificationOutcome;
  dueDate?: string;
  completedAt?: string;
  userNotes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  organizationId: string;
  websiteId?: string;
  type: 'traffic_drop' | 'critical_finding' | 'audit_completed' | 'task_verified' | 'sync_failed';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface ClientReport {
  id: string;
  organizationId: string;
  websiteId: string;
  websiteName: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  seoScore: number;
  geoScore: number;
  aeoScore: number;
  criticalIssuesResolved: number;
  openTasksCount: number;
  impressionsTotal: number;
  clicksTotal: number;
  generatedAt: string;
}
