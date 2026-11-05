// RankPilot AI Master TypeScript Definitions

export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';

export type PlanTier = 'free' | 'freelancer' | 'agency' | 'team' | 'solo' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'user' | 'admin' | 'superadmin';
  userType?: 'freelancer' | 'agency' | 'in_house' | 'other';
  companyName?: string;
  timeZone?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: PlanTier;
  billingEmail?: string;
  maxWebsites: number;
  maxCrawledPagesPerAudit: number;
  maxAiAnalysesPerMonth: number;
  createdAt: string;
}

export interface Subscription {
  id: string;
  organizationId: string;
  provider: 'lemon_squeezy' | 'paddle' | 'stripe' | 'manual' | 'free';
  providerSubscriptionId?: string;
  providerCustomerId?: string;
  plan: PlanTier;
  billingCycle: BillingCycle;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionEntitlements {
  id: string;
  organizationId: string;
  plan: PlanTier;
  maxWebsites: number;
  maxCrawledPages: number;
  maxSavedReports: number;
  historyRetentionDays: number;
  hasGscSync: boolean;
  hasStrikingDistance: boolean;
  hasTrafficDropEngine: boolean;
  hasKeywordClustering: boolean;
  hasTeamSeats: boolean;
  hasApiAccess: boolean;
  hasWhiteLabelReports: boolean;
}

export interface UsageRecord {
  id: string;
  organizationId: string;
  metric: string;
  periodMonth: string;
  currentCount: number;
  updatedAt: string;
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
export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'notice';
export type FindingType = 'confirmed_error' | 'warning' | 'opportunity' | 'informational' | 'not_tested';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type EstimatedEffort = 'quick_fix' | 'moderate' | 'complex';

export interface FindingEvidence {
  expected: string;
  actual: string;
  snippet?: string;
  statusCode?: number;
  headers?: Record<string, string>;
  rawProof?: string;
}

export interface AuditFinding {
  id: string;
  auditRunId: string;
  websiteId: string;
  organizationId?: string;
  url: string;
  category: FindingCategory;
  findingType?: FindingType;
  issueType: string;
  severity: FindingSeverity;
  priority?: TaskPriority;
  title: string;
  description: string;
  whyItMatters?: string;
  recommendation: string;
  implementationSteps?: string[];
  verificationCriteria?: string;
  estimatedEffort?: EstimatedEffort;
  confidenceLevel: ConfidenceLevel;
  detectionMethod: string;
  evidence: FindingEvidence;
  firstDetectedAt?: string;
  lastDetectedAt?: string;
  isResolved: boolean;
  createdAt: string;
}

export type AuditRunStatus =
  | 'pending'
  | 'queued'
  | 'crawling'
  | 'analyzing'
  | 'generating_recommendations'
  | 'completed'
  | 'partially_completed'
  | 'failed'
  | 'cancelled';

export interface AuditRun {
  id: string;
  websiteId: string;
  organizationId?: string;
  status: AuditRunStatus;
  pagesCrawled: number;
  pagesDiscovered?: number;
  pagesFailed?: number;
  seoScore: number;
  geoScore: number;
  aeoScore: number;
  technicalScore?: number;
  isProvisionalScore?: boolean;
  crawlDurationMs: number;
  scoreBreakdown?: any;
  crawlLimits?: {
    plan: string;
    maxAllowedPages: number;
    limitReached: boolean;
    reason?: string;
  };
  auditVersion?: string;
  scoringVersion?: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  findingsCount: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    notice?: number;
    opportunities?: number;
    notTested?: number;
  };
}

export type CrawlJobStatus = AuditRunStatus;

export interface CrawlJob {
  id: string;
  websiteId: string;
  auditRunId: string;
  organizationId: string;
  status: CrawlJobStatus;
  progressPercent: number;
  currentStage: string;
  urlsDiscovered: number;
  urlsCrawled: number;
  urlsRemaining: number;
  urlsFailed: number;
  maxPages: number;
  maxDepth: number;
  crawlOptions?: Record<string, any>;
  discoveredUrls?: string[];
  crawledUrls?: string[];
  failedUrls?: Array<{ url: string; error: string }>;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export type SeoOpportunityCategory =
  | 'keyword_opportunities'
  | 'ctr_improvements'
  | 'question_keywords'
  | 'content_optimization'
  | 'technical_seo'
  | 'internal_linking'
  | 'content_decay'
  | 'serp_growth'
  | 'ai_overviews'
  | 'geo_aeo';

export interface SeoOpportunityEvidence {
  gscMetrics?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    deltaClicks?: number;
    deltaImpressions?: number;
    deltaPosition?: number;
    benchmarkCtr?: number;
  };
  auditFindingIds?: string[];
  auditFindings?: Array<{
    id: string;
    title: string;
    issueType: string;
    severity: string;
    url: string;
    evidence?: any;
  }>;
  keywordClassification?: {
    intent?: 'informational' | 'commercial' | 'transactional' | 'navigational';
    isQuestion?: boolean;
    isBranded?: boolean;
    isLongTail?: boolean;
    matchedPattern?: string;
  };
  textProof?: string;
  dataPoints?: Record<string, any>;
}

export interface SeoOpportunity {
  id: string;
  websiteId: string;
  type: string; // Backward compatible with 'high_impressions_low_ctr' | 'striking_distance_5_20' | etc.
  category?: SeoOpportunityCategory;
  title?: string;
  query: string;
  pageUrl: string;
  impressions: number;
  clicks: number;
  ctr: number;
  position: number;
  potentialImpact: 'critical' | 'high' | 'medium' | 'low';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  confidenceLevel?: 'high' | 'medium' | 'low';
  hypothesis: string; // Why this is an opportunity
  whyItMatters?: string;
  expertExplanation?: string;
  recommendedAction: string;
  recommendedStrategy?: string;
  implementationSteps?: string[];
  expectedBenefit?: string;
  verificationMethod?: string;
  evidence?: SeoOpportunityEvidence;
  status: 'open' | 'actioned' | 'dismissed';
  createdAt?: string;
}

export type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'completed'
  | 'verification_pending'
  | 'verified'
  | 'not_improved'
  | 'dismissed';

export type VerificationOutcome =
  | 'unverified'
  | 'completed_verified'
  | 'completed_not_verified'
  | 'still_unresolved'
  | 'unable_to_verify'
  | 'verified'
  | 'not_improved';

export interface ActionItemBaselineMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  date?: string;
  dateRange?: string;
}

export interface ActionItemMetricDelta {
  clicksChange: number;
  clicksChangePct: number;
  impressionsChange: number;
  impressionsChangePct: number;
  ctrChange: number;
  positionChange: number;
}

export interface ActionItem {
  id: string;
  organizationId: string;
  websiteId: string;
  sourceType: 'audit_finding' | 'seo_opportunity' | 'traffic_investigation' | 'manual';
  sourceId?: string;
  findingId?: string;
  auditRunId?: string;
  title: string;
  description: string;
  category: FindingCategory;
  priority: TaskPriority;
  severity?: FindingSeverity;
  affectedUrl: string;
  recommendedSolution: string;
  steps: string[];
  verificationCriteria?: string;
  estimatedEffort?: EstimatedEffort;
  status: TaskStatus;
  verificationStatus: VerificationOutcome;
  dueDate?: string;
  completedAt?: string;
  userNotes?: string;
  createdAt: string;

  // Extended SEO Opportunity & Action Center Fields
  targetKeyword?: string;
  opportunityCategory?: string;
  baselineMetrics?: ActionItemBaselineMetrics;
  latestMetrics?: ActionItemBaselineMetrics;
  metricDelta?: ActionItemMetricDelta;
  expectedOutcome?: string;
  evidenceSummary?: string;
  relatedAuditFindings?: any[];
  verificationExplanation?: string;
  verificationMethod?: string;
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
