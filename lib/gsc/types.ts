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
