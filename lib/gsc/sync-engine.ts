import { GscPerformanceRow, GscSyncResult, GscProperty } from './types';
import { isGoogleOAuthConfigured } from './oauth';
import { storage } from '../storage';

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

export async function fetchGscProperties(accessToken: string): Promise<GscProperty[]> {
  if (!isGoogleOAuthConfigured() || accessToken.startsWith('mock_')) {
    const websites = storage.getWebsites();
    return websites.map(w => ({
      siteUrl: `sc-domain:${w.domain}`,
      permissionLevel: 'siteOwner',
      isConnected: true,
      lastSyncedAt: new Date().toISOString(),
    }));
  }

  const response = await fetch(`${GSC_API_BASE}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to list GSC sites: ${response.statusText}`);
  }

  const data = await response.json();
  const siteEntries = data.siteEntry || [];

  return siteEntries.map((site: any) => ({
    siteUrl: site.siteUrl,
    permissionLevel: site.permissionLevel,
    isConnected: true,
    lastSyncedAt: new Date().toISOString(),
  }));
}

export async function syncGscPerformance(
  websiteId: string,
  daysCount: number = 28,
  accessToken?: string
): Promise<GscSyncResult> {
  const website = storage.getWebsiteById(websiteId);
  if (!website) {
    throw new Error(`Website not found: ${websiteId}`);
  }

  // Account for Search Console 3-day data latency
  const now = new Date();
  const endDateObj = new Date(now.getTime() - 3 * 86400000);
  const startDateObj = new Date(endDateObj.getTime() - daysCount * 86400000);

  const startDate = startDateObj.toISOString().split('T')[0];
  const endDate = endDateObj.toISOString().split('T')[0];

  const isMock = !isGoogleOAuthConfigured() || !accessToken || accessToken.startsWith('mock_');

  let rows: GscPerformanceRow[] = [];

  if (isMock) {
    rows = generateRealisticGscFixtures(website.url, website.domain, daysCount, endDateObj);
  } else {
    // Live Google Search Console API call
    const siteUrl = encodeURIComponent(`sc-domain:${website.domain}`);
    const res = await fetch(`${GSC_API_BASE}/sites/${siteUrl}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['date', 'page', 'query', 'device'],
        rowLimit: 500,
      }),
    });

    if (!res.ok) {
      throw new Error(`GSC query failed (${res.status}): ${await res.text()}`);
    }

    const data = await res.json();
    rows = (data.rows || []).map((row: any) => ({
      date: row.keys[0],
      page: row.keys[1],
      query: row.keys[2],
      device: row.keys[3] || 'desktop',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: Math.round((row.position || 0) * 10) / 10,
    }));
  }

  return {
    propertyUrl: `sc-domain:${website.domain}`,
    syncTimestamp: new Date().toISOString(),
    recordsSynced: rows.length,
    dateRange: { start: startDate, end: endDate },
    metrics: rows,
    isMockMode: isMock,
  };
}

function generateRealisticGscFixtures(
  baseUrl: string,
  domain: string,
  daysCount: number,
  endDateObj: Date
): GscPerformanceRow[] {
  const rows: GscPerformanceRow[] = [];
  const cleanBase = baseUrl.replace(/\/$/, '');

  const queryProfiles = [
    { query: 'predictive churn modeling software', path: '/features/churn-prediction', baseImp: 500, baseClicks: 12, pos: 7.8 },
    { query: 'saas metric dashboard templates', path: '/templates', baseImp: 1000, baseClicks: 10, pos: 4.2 },
    { query: 'customer retention metrics guide', path: '/blog/customer-retention-metrics', baseImp: 350, baseClicks: 7, pos: 6.1 },
    { query: 'enterprise customer analytics platform', path: '/features/customer-analytics', baseImp: 420, baseClicks: 18, pos: 5.4 },
    { query: `${domain} pricing plans`, path: '/pricing', baseImp: 280, baseClicks: 32, pos: 1.8 },
    { query: 'b2b churn prediction algorithms', path: '/blog/churn-prediction-models', baseImp: 190, baseClicks: 4, pos: 11.3 },
    { query: 'saas ltv to cac ratio benchmarks', path: '/blog/ltv-cac-benchmarks', baseImp: 310, baseClicks: 9, pos: 8.7 },
  ];

  for (let d = daysCount; d >= 0; d--) {
    const curDate = new Date(endDateObj.getTime() - d * 86400000).toISOString().split('T')[0];

    for (const q of queryProfiles) {
      // Add slight organic noise (+-15%)
      const noise = 0.85 + Math.random() * 0.3;
      const impressions = Math.max(10, Math.round(q.baseImp * noise));
      const clicks = Math.max(0, Math.round(q.baseClicks * noise));
      const ctr = impressions > 0 ? clicks / impressions : 0;
      const position = Math.round((q.pos + (Math.random() * 0.6 - 0.3)) * 10) / 10;

      rows.push({
        date: curDate,
        page: `${cleanBase}${q.path}`,
        query: q.query,
        clicks,
        impressions,
        ctr,
        position,
        device: 'desktop',
      });
    }
  }

  return rows;
}
