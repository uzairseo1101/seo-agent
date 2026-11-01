import { GscPerformanceRow } from './types';
import { SeoOpportunity } from '../types';

export interface OpportunityDiscoveryOptions {
  strikingDistanceMinPosition?: number; // default: 5.0
  strikingDistanceMaxPosition?: number; // default: 20.0
  minImpressions?: number; // default: 500
}

export function discoverSeoOpportunities(
  websiteId: string,
  rows: GscPerformanceRow[],
  options: OpportunityDiscoveryOptions = {}
): SeoOpportunity[] {
  const minPos = options.strikingDistanceMinPosition ?? 5.0;
  const maxPos = options.strikingDistanceMaxPosition ?? 20.0;
  const minImp = options.minImpressions ?? 500;

  // Aggregate by query + page
  const queryAgg = new Map<string, {
    query: string;
    page: string;
    totalClicks: number;
    totalImpressions: number;
    weightedPositionSum: number;
  }>();

  for (const row of rows) {
    const key = `${row.query.toLowerCase()}|||${row.page}`;
    const existing = queryAgg.get(key) || {
      query: row.query,
      page: row.page,
      totalClicks: 0,
      totalImpressions: 0,
      weightedPositionSum: 0,
    };

    existing.totalClicks += row.clicks;
    existing.totalImpressions += row.impressions;
    existing.weightedPositionSum += row.position * row.impressions;
    queryAgg.set(key, existing);
  }

  const opportunities: SeoOpportunity[] = [];

  for (const [, agg] of queryAgg.entries()) {
    if (agg.totalImpressions < minImp) continue;

    const avgPos = Math.round((agg.weightedPositionSum / agg.totalImpressions) * 10) / 10;
    const ctr = agg.totalImpressions > 0 ? agg.totalClicks / agg.totalImpressions : 0;

    // Type 1: High Impressions & Low CTR
    // If ranking on page 1 (pos <= 8) with >= 2,000 impressions but CTR < 1.8%
    if (avgPos <= 8.0 && agg.totalImpressions >= 2000 && ctr < 0.018) {
      opportunities.push({
        id: `opp-ctr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'high_impressions_low_ctr',
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: agg.totalImpressions > 10000 ? 'critical' : 'high',
        hypothesis: `High impression volume (${agg.totalImpressions.toLocaleString()}) at position ${avgPos}, but current CTR is only ${(ctr * 100).toFixed(2)}% (industry benchmark for top 8 is ~3–7%). The search snippet is likely uncompelling.`,
        recommendedAction: `Rewrite <meta name="description"> and Title tag on ${agg.page}. Highlight primary differentiator, actionable deliverables, and clear click incentive.`,
        status: 'open',
      });
      continue;
    }

    // Type 2: Striking Distance Queries (Positions 5.0 to 20.0)
    if (avgPos >= minPos && avgPos <= maxPos && agg.totalImpressions >= minImp) {
      opportunities.push({
        id: `opp-str-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'striking_distance_5_20',
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: avgPos <= 10.0 ? 'high' : 'medium',
        hypothesis: `Query ranks at position ${avgPos} with ${agg.totalImpressions.toLocaleString()} verified impressions. Moving into the top 3 SERP positions typically yields a 4x–8x increase in organic click capture.`,
        recommendedAction: `Add internal links pointing to ${agg.page} using exact/partial anchor text for "${agg.query}". Expand supporting subheadings (H2/H3) addressing search intent.`,
        status: 'open',
      });
    }
  }

  // Sort by potential impact and impressions descending
  return opportunities.sort((a, b) => b.impressions - a.impressions);
}
