import { GscPerformanceRow, TrafficDropComparison } from './types';

export function calculateChangePct(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100.0 : 0.0;
  }
  const pct = ((current - previous) / previous) * 100;
  return Math.round(pct * 10) / 10;
}

export function investigateTrafficDrop(
  websiteId: string,
  currentPeriodRows: GscPerformanceRow[],
  previousPeriodRows: GscPerformanceRow[],
  currentRange: { start: string; end: string },
  previousRange: { start: string; end: string }
): TrafficDropComparison {
  // Aggregate current totals
  const curTotals = aggregatePeriodTotals(currentPeriodRows);
  const prevTotals = aggregatePeriodTotals(previousPeriodRows);

  const clicksChange = curTotals.clicks - prevTotals.clicks;
  const clicksChangePct = calculateChangePct(curTotals.clicks, prevTotals.clicks);

  const impChange = curTotals.impressions - prevTotals.impressions;
  const impChangePct = calculateChangePct(curTotals.impressions, prevTotals.impressions);

  const ctrChangePct = calculateChangePct(curTotals.ctr, prevTotals.ctr);
  const positionChange = Math.round((curTotals.position - prevTotals.position) * 10) / 10;

  // Aggregate page-level comparisons
  const pageMap = new Map<string, {
    prevClicks: number;
    curClicks: number;
    prevImp: number;
    curImp: number;
  }>();

  for (const row of previousPeriodRows) {
    const existing = pageMap.get(row.page) || { prevClicks: 0, curClicks: 0, prevImp: 0, curImp: 0 };
    existing.prevClicks += row.clicks;
    existing.prevImp += row.impressions;
    pageMap.set(row.page, existing);
  }

  for (const row of currentPeriodRows) {
    const existing = pageMap.get(row.page) || { prevClicks: 0, curClicks: 0, prevImp: 0, curImp: 0 };
    existing.curClicks += row.clicks;
    existing.curImp += row.impressions;
    pageMap.set(row.page, existing);
  }

  const affectedPages: TrafficDropComparison['affectedPages'] = [];

  for (const [pageUrl, stats] of pageMap.entries()) {
    const clickDrop = stats.prevClicks - stats.curClicks;
    if (clickDrop > 0 && stats.prevClicks >= 20) {
      const dropPct = calculateChangePct(stats.curClicks, stats.prevClicks);
      
      // Determine evidence-based hypothesis
      let hypothesis = 'Organic click volume declined.';
      if (stats.curImp >= stats.prevImp * 0.9 && stats.curClicks < stats.prevClicks * 0.7) {
        hypothesis = 'Impression volume remained stable while CTR collapsed. Suggests rich snippet loss, competitor title rewrites, or SERP layout changes.';
      } else if (stats.curImp < stats.prevImp * 0.6) {
        hypothesis = 'Substantial impression decline. Check for indexability issues (noindex/canonical changes) or keyword intent shift away from this URL.';
      }

      affectedPages.push({
        pageUrl,
        previousClicks: stats.prevClicks,
        currentClicks: stats.curClicks,
        clickDrop,
        clickDropPct: dropPct,
        previousImpressions: stats.prevImp,
        currentImpressions: stats.curImp,
        hypothesis,
      });
    }
  }

  // Aggregate query-level comparisons
  const queryMap = new Map<string, {
    prevClicks: number;
    curClicks: number;
    prevPosSum: number;
    prevPosImp: number;
    curPosSum: number;
    curPosImp: number;
  }>();

  for (const row of previousPeriodRows) {
    const existing = queryMap.get(row.query) || { prevClicks: 0, curClicks: 0, prevPosSum: 0, prevPosImp: 0, curPosSum: 0, curPosImp: 0 };
    existing.prevClicks += row.clicks;
    existing.prevPosSum += row.position * row.impressions;
    existing.prevPosImp += row.impressions;
    queryMap.set(row.query, existing);
  }

  for (const row of currentPeriodRows) {
    const existing = queryMap.get(row.query) || { prevClicks: 0, curClicks: 0, prevPosSum: 0, prevPosImp: 0, curPosSum: 0, curPosImp: 0 };
    existing.curClicks += row.clicks;
    existing.curPosSum += row.position * row.impressions;
    existing.curPosImp += row.impressions;
    queryMap.set(row.query, existing);
  }

  const affectedQueries: TrafficDropComparison['affectedQueries'] = [];

  for (const [query, stats] of queryMap.entries()) {
    const clickDrop = stats.prevClicks - stats.curClicks;
    if (clickDrop > 0 && stats.prevClicks >= 15) {
      const prevPos = stats.prevPosImp > 0 ? Math.round((stats.prevPosSum / stats.prevPosImp) * 10) / 10 : 0;
      const curPos = stats.curPosImp > 0 ? Math.round((stats.curPosSum / stats.curPosImp) * 10) / 10 : 0;

      let hypothesis = 'Query click volume dropped.';
      if (curPos > prevPos + 1.5) {
        hypothesis = `Average ranking slipped from ${prevPos} to ${curPos}, pushing the listing down or onto page 2.`;
      } else {
        hypothesis = 'Position was relatively stable, but search demand or SERP snippet attractiveness declined.';
      }

      affectedQueries.push({
        query,
        previousClicks: stats.prevClicks,
        currentClicks: stats.curClicks,
        clickDrop,
        previousPosition: prevPos,
        currentPosition: curPos,
        hypothesis,
      });
    }
  }

  // Sort by greatest absolute click loss
  affectedPages.sort((a, b) => b.clickDrop - a.clickDrop);
  affectedQueries.sort((a, b) => b.clickDrop - a.clickDrop);

  return {
    websiteId,
    periodCurrent: {
      startDate: currentRange.start,
      endDate: currentRange.end,
      totalClicks: curTotals.clicks,
      totalImpressions: curTotals.impressions,
      avgCtr: curTotals.ctr,
      avgPosition: curTotals.position,
    },
    periodPrevious: {
      startDate: previousRange.start,
      endDate: previousRange.end,
      totalClicks: prevTotals.clicks,
      totalImpressions: prevTotals.impressions,
      avgCtr: prevTotals.ctr,
      avgPosition: prevTotals.position,
    },
    deltas: {
      clicksChange,
      clicksChangePct,
      impressionsChange: impChange,
      impressionsChangePct: impChangePct,
      ctrChangePct,
      positionChange,
    },
    affectedPages: affectedPages.slice(0, 10),
    affectedQueries: affectedQueries.slice(0, 10),
  };
}

function aggregatePeriodTotals(rows: GscPerformanceRow[]) {
  let clicks = 0;
  let impressions = 0;
  let posSum = 0;

  for (const r of rows) {
    clicks += r.clicks;
    impressions += r.impressions;
    posSum += r.position * r.impressions;
  }

  const ctr = impressions > 0 ? Math.round((clicks / impressions) * 10000) / 10000 : 0;
  const position = impressions > 0 ? Math.round((posSum / impressions) * 10) / 10 : 0;

  return { clicks, impressions, ctr, position };
}
