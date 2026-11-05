// Google Search Console Master TypeScript Definitions

export interface GscProperty {
  siteUrl: string;
  permissionLevel: 'siteOwner' | 'siteFullUser' | 'siteRestrictedUser';
  isConnected: boolean;
  lastSyncedAt?: string;
}

export interface GscPerformanceRow {
  date: string;
  page: string;
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  device?: 'desktop' | 'mobile' | 'tablet';
  country?: string;
}

export interface GscDateRange {
  startDate: string;
  endDate: string;
  comparisonStartDate?: string;
  comparisonEndDate?: string;
}

export interface GscSyncResult {
  propertyUrl: string;
  syncTimestamp: string;
  recordsSynced: number;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: GscPerformanceRow[];
  isMockMode: boolean;
}

export interface TrafficDropComparison {
  websiteId: string;
  periodCurrent: {
    startDate: string;
    endDate: string;
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  periodPrevious: {
    startDate: string;
    endDate: string;
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  deltas: {
    clicksChange: number;
    clicksChangePct: number;
    impressionsChange: number;
    impressionsChangePct: number;
    ctrChangePct: number;
    positionChange: number;
  };
  affectedPages: Array<{
    pageUrl: string;
    previousClicks: number;
    currentClicks: number;
    clickDrop: number;
    clickDropPct: number;
    previousImpressions: number;
    currentImpressions: number;
    hypothesis: string;
  }>;
  affectedQueries: Array<{
    query: string;
    previousClicks: number;
    currentClicks: number;
    clickDrop: number;
    previousPosition: number;
    currentPosition: number;
    hypothesis: string;
  }>;
}

export type GscIntentType =
  | 'all'
  | 'questions'
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'branded'
  | 'non_branded'
  | 'custom_regex';

export interface BrandConfiguration {
  brandNames: string[];
  competitorNames?: string[];
}

export interface GscKeywordAnalysisQuery {
  query: string;
  topPage: string;
  pages: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  isQuestion: boolean;
  isBranded: boolean;
  isCompetitor: boolean;
  isLongTail: boolean;
  matchedPattern?: string;
  positionBracket: 'pos_1_3' | 'pos_4_10' | 'pos_11_20' | 'pos_21_plus';
  expectedCtrBenchmark: number;
  ctrHealth: 'strong' | 'average' | 'underperforming';
}

export interface GscKeywordAnalysisPage {
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  avgPosition: number;
  topQueries: string[];
  queryCount: number;
  hasCrawlFindings?: boolean;
}

export interface GscKeywordAnalysisSummary {
  totalQueries: number;
  filteredQueries: number;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgPosition: number;
  brandedClicks: number;
  nonBrandedClicks: number;
  brandedClicksPct: number;
  nonBrandedClicksPct: number;
  questionsCount: number;
  zeroClickCount: number;
  strikingDistanceCount: number;
  datasetScopeNote: string;
}

export interface GscKeywordAnalysisResult {
  queries: GscKeywordAnalysisQuery[];
  pages: GscKeywordAnalysisPage[];
  summary: GscKeywordAnalysisSummary;
  regexValidation: {
    isValid: boolean;
    patternUsed?: string;
    errorMessage?: string;
    syntaxHelp: string;
  };
}
