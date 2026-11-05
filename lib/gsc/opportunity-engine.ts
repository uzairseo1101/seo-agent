// RankPilot AI — Evidence-Backed SEO Opportunity Intelligence Engine

import { GscPerformanceRow, BrandConfiguration } from './types';
import { SeoOpportunity, SeoOpportunityCategory, AuditFinding } from '../types';
import { classifySearchIntent, getPositionCtrBenchmark, GSC_REGEX_PRESETS } from './regex-engine';

export interface OpportunityDiscoveryOptions {
  strikingDistanceMinPosition?: number; // default: 4.0
  strikingDistanceMaxPosition?: number; // default: 20.0
  minImpressions?: number; // default: 500
  brandConfig?: BrandConfiguration;
  periodPreviousRows?: GscPerformanceRow[];
  auditFindings?: AuditFinding[];
  crawledPages?: Array<{ url: string; wordCount?: number; internalLinksCount?: number }>;
  generateAiOverviewOpps?: boolean;
  generateGeoAeoOpps?: boolean;
}

/**
 * Normalizes URL for clean matching with audit findings.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '').toLowerCase();
  } catch {
    return url.replace(/\/$/, '').toLowerCase();
  }
}

/**
 * Discovers evidence-based SEO opportunities by combining actual GSC performance data
 * with crawler audit findings and technical SEO signals.
 */
export function discoverSeoOpportunities(
  websiteId: string,
  rows: GscPerformanceRow[],
  options: OpportunityDiscoveryOptions = {}
): SeoOpportunity[] {
  const minPos = options.strikingDistanceMinPosition ?? 4.0;
  const maxPos = options.strikingDistanceMaxPosition ?? 20.0;
  const minImp = options.minImpressions ?? 500;

  // 1. Index Audit Findings by normalized URL for verified connections
  const findingsByUrl = new Map<string, AuditFinding[]>();
  if (options.auditFindings && options.auditFindings.length > 0) {
    for (const f of options.auditFindings) {
      const norm = normalizeUrl(f.url);
      const list = findingsByUrl.get(norm) || [];
      list.push(f);
      findingsByUrl.set(norm, list);
    }
  }

  // 2. Index Previous Period performance for Content Decay detection (Section 4.H)
  const prevQueryMap = new Map<string, { clicks: number; impressions: number; position: number }>();
  if (options.periodPreviousRows && options.periodPreviousRows.length > 0) {
    for (const prow of options.periodPreviousRows) {
      const pKey = `${prow.query.trim().toLowerCase()}|||${prow.page.trim()}`;
      const cur = prevQueryMap.get(pKey) || { clicks: 0, impressions: 0, position: 0 };
      cur.clicks += prow.clicks;
      cur.impressions += prow.impressions;
      cur.position = prow.position;
      prevQueryMap.set(pKey, cur);
    }
  }

  // 3. Aggregate current GSC records by query + page
  const queryAgg = new Map<string, {
    query: string;
    page: string;
    totalClicks: number;
    totalImpressions: number;
    weightedPositionSum: number;
  }>();

  // Multi-page cannibalization tracker
  const queryToPages = new Map<string, Set<string>>();

  for (const row of rows) {
    const qTrim = row.query.trim();
    const pTrim = row.page.trim();
    const key = `${qTrim.toLowerCase()}|||${pTrim}`;

    const existing = queryAgg.get(key) || {
      query: qTrim,
      page: pTrim,
      totalClicks: 0,
      totalImpressions: 0,
      weightedPositionSum: 0,
    };

    existing.totalClicks += row.clicks;
    existing.totalImpressions += row.impressions;
    existing.weightedPositionSum += row.position * row.impressions;
    queryAgg.set(key, existing);

    const pagesSet = queryToPages.get(qTrim.toLowerCase()) || new Set<string>();
    pagesSet.add(pTrim);
    queryToPages.set(qTrim.toLowerCase(), pagesSet);
  }

  const opportunities: SeoOpportunity[] = [];
  const processedKeys = new Set<string>();

  for (const [, agg] of queryAgg.entries()) {
    if (agg.totalImpressions < minImp) continue;

    const avgPos = Math.round((agg.weightedPositionSum / agg.totalImpressions) * 10) / 10;
    const ctr = agg.totalImpressions > 0 ? agg.totalClicks / agg.totalImpressions : 0;
    const normPage = normalizeUrl(agg.page);
    const relatedFindings = findingsByUrl.get(normPage) || [];
    const classification = classifySearchIntent(agg.query, options.brandConfig);
    const benchmarkCtr = getPositionCtrBenchmark(avgPos);

    const oppKey = `${agg.query.toLowerCase()}|||${agg.page}`;
    if (processedKeys.has(oppKey)) continue;

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 1: Question-Based Queries (Section 4.E & 6 / Category 3)
    // Interrogative intent prioritizing direct answers & Q&A structure
    // -------------------------------------------------------------------------
    if (classification.isQuestion && agg.totalImpressions >= Math.max(50, Math.min(minImp, 300))) {
      processedKeys.add(oppKey);
      opportunities.push({
        id: `opp-question-${agg.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'question_intent_optimization',
        category: 'question_keywords',
        title: `Direct Answer & Q&A Strategy: "${agg.query}"`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: avgPos <= 10.0 ? 'high' : 'medium',
        priority: avgPos <= 10.0 ? 'high' : 'medium',
        confidenceLevel: 'high',
        hypothesis: `Searcher query "${agg.query}" expresses explicit interrogative intent with ${agg.totalImpressions.toLocaleString()} impressions at position ${avgPos}. Providing a structured, direct answer maximizes organic click capture and AI search visibility.`,
        whyItMatters: `Conversational and question-based searches have 2.4x higher eligibility for Google AI Overviews and answer engine citations (Perplexity, ChatGPT, Gemini).`,
        expertExplanation: `Question queries require immediate, factual resolution. Pages that bury the answer beneath filler text lose both users and search bots. Answering concisely in the first 45 words establishes topical clarity. Note: Structured FAQ schema enhances machine parsing but does not guarantee rich snippets or AI citations.`,
        recommendedAction: `Add a dedicated H2/H3 heading matching "${agg.query}" on ${agg.page} with a concise 40–60 word direct answer paragraph immediately following.`,
        recommendedStrategy: `Google AI Overviews & Answer Engine (AEO) Optimization: Answer the question directly, followed by bulleted supporting steps, evidence, and clear definitions.`,
        implementationSteps: [
          `Add an H2 or H3 heading on ${agg.page}: "${agg.query.charAt(0).toUpperCase() + agg.query.slice(1)}?"`,
          `Write a direct, objective 40–50 word answer paragraph immediately below the heading.`,
          `Follow with an unordered list or step-by-step numbered breakdown explaining the answer.`,
          `Include a concrete example or data point supporting the explanation.`,
          `Ensure FAQ or Q&A structured data conforms to Schema.org standards (without assuming guaranteed SERP rich treatment).`,
        ],
        expectedBenefit: `Improved position for "${agg.query}" into top 3 and increased citation probability in Google AI Overviews.`,
        verificationMethod: `Verify presence of question heading and monitor GSC position for query across next sync.`,
        evidence: {
          gscMetrics: { clicks: agg.totalClicks, impressions: agg.totalImpressions, ctr: Math.round(ctr * 10000) / 10000, position: avgPos },
          keywordClassification: classification,
          textProof: `Matched question pattern "${classification.matchedPattern || 'interrogative'}" with ${agg.totalImpressions.toLocaleString()} impressions.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 2: High Impressions & Low CTR (Section 4.C / Category 2)
    // Position-aware CTR benchmark evaluation
    // -------------------------------------------------------------------------
    const isUnderperformingCtr = (
      (avgPos <= 8.0 && agg.totalImpressions >= 2000 && ctr < 0.018) ||
      (avgPos <= 5.0 && agg.totalImpressions >= 1000 && ctr < 0.035) ||
      (avgPos <= 2.5 && agg.totalImpressions >= 1000 && ctr < 0.08)
    );

    if (isUnderperformingCtr) {
      processedKeys.add(oppKey);
      const titleAuditFinding = relatedFindings.find(f => f.issueType.includes('title') || f.issueType.includes('meta'));
      
      opportunities.push({
        id: `opp-ctr-${agg.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'high_impressions_low_ctr',
        category: 'ctr_improvements',
        title: `Optimize SERP Snippet for "${agg.query}"`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: agg.totalImpressions > 10000 || avgPos <= 3 ? 'critical' : 'high',
        priority: agg.totalImpressions > 10000 || avgPos <= 3 ? 'critical' : 'high',
        confidenceLevel: agg.totalImpressions >= 2500 ? 'high' : 'medium',
        hypothesis: `High impression volume (${agg.totalImpressions.toLocaleString()}) at position ${avgPos}, but current CTR is only ${(ctr * 100).toFixed(2)}% (position-aware benchmark for pos ${avgPos} is ~${(benchmarkCtr * 100).toFixed(1)}%). The organic search snippet is likely uncompelling or misaligned with searcher intent.`,
        whyItMatters: `At position ${avgPos}, lifting CTR to benchmark would capture an estimated ${Math.round(agg.totalImpressions * Math.max(0.01, benchmarkCtr - ctr)).toLocaleString()} additional organic clicks per month without needing higher rank.`,
        expertExplanation: `When Google ranks a page in the top 8 positions, search impressions accumulate rapidly. If searchers consistently choose other results, Google algorithms may gradually demote the listing. Aligning title hooks and meta descriptions directly addresses the click gap.`,
        recommendedAction: `Rewrite <meta name="description"> and Title tag on ${agg.page}. Highlight primary differentiator, actionable deliverables, and clear click incentive.`,
        recommendedStrategy: `Google SERP Optimization: Incorporate primary search hook "${agg.query}", front-load primary value proposition in <title> (under 60 characters), and write an active-voice meta description with structured benefits.`,
        implementationSteps: [
          `Inspect the existing <title> and <meta name="description"> on ${agg.page}.`,
          `Ensure the exact query "${agg.query}" or core entity appears in the first 45 characters of the Title tag.`,
          `Include an actionable value hook (e.g., Guide, Calculator, Template, Pricing, Checklist).`,
          `Draft a 150-character meta description with a direct benefit and call-to-click.`,
          titleAuditFinding ? `Resolve verified crawler finding: "${titleAuditFinding.title}".` : `Validate snippet rendering in Google SERP simulator.`,
          `Request page re-indexing via Google Search Console.`,
        ],
        expectedBenefit: `Projected +${Math.round(agg.totalImpressions * Math.max(0.01, benchmarkCtr - ctr)).toLocaleString()} incremental organic clicks over 28-day cycle.`,
        verificationMethod: `Compare Search Console CTR for "${agg.query}" 28 days post-implementation against baseline ${(ctr * 100).toFixed(2)}%.`,
        evidence: {
          gscMetrics: {
            clicks: agg.totalClicks,
            impressions: agg.totalImpressions,
            ctr: Math.round(ctr * 10000) / 10000,
            position: avgPos,
            benchmarkCtr,
          },
          auditFindings: titleAuditFinding ? [{
            id: titleAuditFinding.id,
            title: titleAuditFinding.title,
            issueType: titleAuditFinding.issueType,
            severity: titleAuditFinding.severity,
            url: titleAuditFinding.url,
            evidence: titleAuditFinding.evidence,
          }] : undefined,
          keywordClassification: classification,
          textProof: `Verified GSC record: ${agg.totalImpressions.toLocaleString()} impressions, ${agg.totalClicks} clicks, CTR ${(ctr * 100).toFixed(2)}% at position ${avgPos}.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 2: Zero-Click Queries (Section 4.B / Category 2)
    // -------------------------------------------------------------------------
    if (agg.totalClicks === 0 && agg.totalImpressions >= Math.max(100, Math.min(minImp, 500))) {
      processedKeys.add(oppKey);
      const isPosLow = avgPos > 20.0;
      const isPageOneZeroClick = avgPos <= 10.0;

      opportunities.push({
        id: `opp-zeroclick-${agg.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'zero_clicks_with_impressions',
        category: 'ctr_improvements',
        title: `Zero-Click Search Query: "${agg.query}"`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: 0,
        ctr: 0,
        position: avgPos,
        potentialImpact: isPageOneZeroClick ? 'high' : 'medium',
        priority: isPageOneZeroClick ? 'high' : 'medium',
        confidenceLevel: agg.totalImpressions >= 1000 ? 'high' : 'medium',
        hypothesis: isPageOneZeroClick
          ? `Page ranks on Page 1 (position ${avgPos}) with ${agg.totalImpressions.toLocaleString()} impressions but earned 0 recorded clicks. Searchers are finding instant answers in SERP features or skipping the snippet due to intent mismatch.`
          : `Query generated ${agg.totalImpressions.toLocaleString()} impressions but 0 clicks. Ranking position ${avgPos} is on Page ${Math.ceil(avgPos / 10)}, where organic click-through is virtually non-existent without ranking advancement.`,
        whyItMatters: `${agg.totalImpressions.toLocaleString()} verified searchers viewed a SERP displaying this page, representing zero traffic conversion.`,
        expertExplanation: isPageOneZeroClick
          ? `A Page 1 zero-click query indicates that the current SERP title and description fail to promise the specific answer or tool searchers require. Check if a SERP Feature (Knowledge Graph or AI Overview) satisfies intent directly.`
          : `Because the page ranks at position ${avgPos}, searchers rarely scroll to this result. This is primarily a ranking depth opportunity rather than an isolated snippet issue.`,
        recommendedAction: isPageOneZeroClick
          ? `Audit snippet intent match on ${agg.page}. Ensure the title promises depth, unique data, or an interactive tool beyond quick SERP definitions.`
          : `Strengthen page content depth and acquire internal link authority to advance position from ${avgPos} toward Page 1.`,
        recommendedStrategy: `Google SERP Optimization: Address the exact search intent of "${agg.query}". Provide a clear reason for searchers to click through rather than bouncing.`,
        implementationSteps: [
          `Inspect Google SERP layout for "${agg.query}" to see if AI Overviews, Featured Snippets, or Ads dominate above the fold.`,
          `Align heading (H1/H2) and page introduction on ${agg.page} to directly address "${agg.query}".`,
          `Add structured summary tables or proprietary examples that cannot be fully consumed on the SERP.`,
          `Add 2-3 internal links from high-authority category pages pointing to ${agg.page}.`,
        ],
        expectedBenefit: `Converting even 1% CTR on ${agg.totalImpressions.toLocaleString()} impressions yields ${Math.round(agg.totalImpressions * 0.01)} organic visits.`,
        verificationMethod: `Monitor Search Console clicks for "${agg.query}" following next performance sync.`,
        evidence: {
          gscMetrics: { clicks: 0, impressions: agg.totalImpressions, ctr: 0, position: avgPos },
          keywordClassification: classification,
          textProof: `Verified 0 clicks across ${agg.totalImpressions.toLocaleString()} impressions at position ${avgPos}.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 4: Technical SEO Audit-Connected (Section 5 / Category 5)
    // -------------------------------------------------------------------------
    if (relatedFindings.length > 0) {
      const critFinding = relatedFindings.find(f => f.severity === 'critical' || f.severity === 'high') || relatedFindings[0];
      processedKeys.add(oppKey);

      opportunities.push({
        id: `opp-tech-${critFinding.id.slice(0, 8)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'technical_audit_impact',
        category: 'technical_seo',
        title: `Resolve ${critFinding.title} on Ranking Page`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: critFinding.severity === 'critical' ? 'critical' : 'high',
        priority: critFinding.severity === 'critical' ? 'critical' : 'high',
        confidenceLevel: 'high',
        hypothesis: `Page receives ${agg.totalImpressions.toLocaleString()} verified GSC impressions for "${agg.query}", but crawler verified an active technical defect: "${critFinding.title}". Technical friction risks ranking degradation and crawl budget waste.`,
        whyItMatters: `Search engines demote pages with verified technical failures (status errors, canonical misconfigurations, missing viewports, or broken headers) especially when competitive alternatives exist.`,
        expertExplanation: `This opportunity combines verified GSC search demand with deterministic crawler audit evidence. The landing page already demonstrates organic ranking potential, meaning resolving the technical barrier directly protects and unlocks organic traffic.`,
        recommendedAction: critFinding.recommendation,
        recommendedStrategy: `Technical SEO Optimization: Correct the underlying technical flaw verified during site audit. Re-crawl to verify resolution.`,
        implementationSteps: [
          `Inspect finding evidence on ${agg.page}: Expected "${critFinding.evidence.expected}", got "${critFinding.evidence.actual}".`,
          `Implement code/configuration fix on the production page.`,
          `Validate using RankPilot Action Center automated verification crawler.`,
          `Submit URL inspection re-crawl in Google Search Console.`,
        ],
        expectedBenefit: `Protects ${agg.totalImpressions.toLocaleString()} impressions from technical ranking penalties and improves crawlability.`,
        verificationMethod: `Automated HTML re-crawl via Action Center verifying ${critFinding.issueType} resolution.`,
        evidence: {
          gscMetrics: { clicks: agg.totalClicks, impressions: agg.totalImpressions, ctr: Math.round(ctr * 10000) / 10000, position: avgPos },
          auditFindingIds: [critFinding.id],
          auditFindings: [{
            id: critFinding.id,
            title: critFinding.title,
            issueType: critFinding.issueType,
            severity: critFinding.severity,
            url: critFinding.url,
            evidence: critFinding.evidence,
          }],
          textProof: `Crawler finding: ${critFinding.title} (${critFinding.severity}) on ${agg.page}. Search Console demand: ${agg.totalImpressions.toLocaleString()} impressions.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 5: Striking Distance Queries (Section 4.D / Category 8)
    // Positions 4.0 to 20.0 with meaningful impressions
    // -------------------------------------------------------------------------
    if (avgPos >= minPos && avgPos <= maxPos && agg.totalImpressions >= minImp) {
      processedKeys.add(oppKey);
      const isTopTen = avgPos <= 10.0;

      opportunities.push({
        id: `opp-str-${agg.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'striking_distance_5_20',
        category: 'serp_growth',
        title: `Striking Distance Push to Top 3: "${agg.query}"`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: isTopTen ? 'high' : 'medium',
        priority: isTopTen ? 'high' : 'medium',
        confidenceLevel: 'high',
        hypothesis: `Query ranks at position ${avgPos} with ${agg.totalImpressions.toLocaleString()} verified impressions. Moving into the top 3 SERP positions typically yields a 4x–8x increase in organic click capture.`,
        whyItMatters: `Positions 1–3 capture over 54% of all organic SERP clicks. A page ranking at ${avgPos} already possesses foundational authority; targeted topical depth and internal links can lift it into high-click territory.`,
        expertExplanation: `Striking-distance queries (positions 4–20) represent the highest return on investment in SEO. The domain has already passed Google's quality threshold for the topic. Expanding supporting subheadings and consolidating internal link equity provides the final ranking boost.`,
        recommendedAction: `Add internal links pointing to ${agg.page} using exact/partial anchor text for "${agg.query}". Expand supporting subheadings (H2/H3) addressing search intent.`,
        recommendedStrategy: `Google SERP Growth Strategy: Topical enrichment and internal PageRank consolidation. Ensure ${agg.page} covers secondary subtopics and entities relevant to "${agg.query}".`,
        implementationSteps: [
          `Review the current content on ${agg.page} to identify gaps against top 3 ranking competitors.`,
          `Add 2-3 supporting subsections addressing primary questions and entity relationships.`,
          `Find 3-5 existing blog posts or category pages on the website and add contextual internal links pointing to ${agg.page} with descriptive anchors.`,
          `Ensure page loading speed and mobile readability remain optimal.`,
        ],
        expectedBenefit: `Advancing position from ${avgPos} to top 3 is estimated to yield +${Math.round(agg.totalImpressions * 0.12)} incremental clicks per month.`,
        verificationMethod: `Track GSC average position for "${agg.query}" over 30 days to measure ranking progression.`,
        evidence: {
          gscMetrics: {
            clicks: agg.totalClicks,
            impressions: agg.totalImpressions,
            ctr: Math.round(ctr * 10000) / 10000,
            position: avgPos,
            benchmarkCtr,
          },
          keywordClassification: classification,
          textProof: `Verified GSC record: Position ${avgPos}, ${agg.totalImpressions.toLocaleString()} impressions, ${agg.totalClicks} clicks.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // OPPORTUNITY TYPE 6: Keywords with Existing Clicks (Section 4.A / Category 1)
    // -------------------------------------------------------------------------
    if (agg.totalClicks >= 15 && avgPos <= 20.0) {
      processedKeys.add(oppKey);
      opportunities.push({
        id: `opp-winner-${agg.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
        websiteId,
        type: 'high_performing_keyword_expansion',
        category: 'keyword_opportunities',
        title: `Expand Topical Footprint: "${agg.query}"`,
        query: agg.query,
        pageUrl: agg.page,
        impressions: agg.totalImpressions,
        clicks: agg.totalClicks,
        ctr: Math.round(ctr * 10000) / 10000,
        position: avgPos,
        potentialImpact: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        hypothesis: `Proven traffic driver: "${agg.query}" generated ${agg.totalClicks} clicks at position ${avgPos}. This landing page has established search equity and can be leveraged to rank for adjacent semantic variations.`,
        whyItMatters: `Pages that Google already trusts to drive organic clicks are the fastest assets to expand into full topical hubs.`,
        expertExplanation: `Rather than publishing new standalone pages that compete for crawl budget and domain authority, expanding a proven ranking page with related subtopics (commercial comparisons, implementation details, templates) multiplies keyword footprint safely.`,
        recommendedAction: `Identify 3–5 related semantic keyword variations and integrate them as dedicated subsections on ${agg.page}.`,
        recommendedStrategy: `Google SERP Topical Expansion: Build out semantic topic clusters around "${agg.query}", cross-linking to related product or feature capabilities.`,
        implementationSteps: [
          `Analyze related search queries associated with ${agg.page} in Google Search Console.`,
          `Add dedicated H2 sections targeting semantic variations (e.g. best practices, benchmarks, tools).`,
          `Place prominent call-to-action (CTA) blocks to maximize conversion from this established traffic stream.`,
        ],
        expectedBenefit: `Expands overall ranking keyword footprint for ${agg.page} and protects current traffic against competitor encroachment.`,
        verificationMethod: `Measure count of distinct queries sending clicks to ${agg.page} across consecutive 28-day syncs.`,
        evidence: {
          gscMetrics: { clicks: agg.totalClicks, impressions: agg.totalImpressions, ctr: Math.round(ctr * 10000) / 10000, position: avgPos },
          keywordClassification: classification,
          textProof: `Verified winner: ${agg.totalClicks} clicks, ${agg.totalImpressions.toLocaleString()} impressions at position ${avgPos}.`,
        },
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      continue;
    }
  }

  // ---------------------------------------------------------------------------
  // Check for Declining Keywords & Content Decay (Section 4.H / Category 7)
  // ---------------------------------------------------------------------------
  if (options.periodPreviousRows && options.periodPreviousRows.length > 0) {
    for (const [key, prev] of prevQueryMap.entries()) {
      const cur = queryAgg.get(key);
      if (!cur || prev.clicks < 20) continue;

      const clickDrop = prev.clicks - cur.totalClicks;
      const dropPct = (clickDrop / prev.clicks) * 100;
      const curPos = cur.totalImpressions > 0 ? cur.weightedPositionSum / cur.totalImpressions : 0;
      const posWorsened = curPos - prev.position;

      // Only flag meaningful drops: >25% click reduction and position slipped >= 1.5
      if (dropPct >= 25 && posWorsened >= 1.5) {
        const [q, p] = key.split('|||');
        const oppId = `opp-decay-${q.replace(/[^a-z0-9]/g, '-').slice(0, 30)}`;
        if (opportunities.some(o => o.id.startsWith(oppId))) continue;

        // Check for multi-page cannibalization evidence
        const pagesForQuery = queryToPages.get(q.toLowerCase()) || new Set();
        const hasCannibalizationEvidence = pagesForQuery.size >= 2;

        opportunities.push({
          id: `${oppId}-${Math.random().toString(36).substring(2, 6)}`,
          websiteId,
          type: hasCannibalizationEvidence ? 'keyword_cannibalization' : 'declining_ctr',
          category: 'content_decay',
          title: hasCannibalizationEvidence
            ? `Investigate Ranking Cannibalization: "${q}"`
            : `Content Decay Remediation: "${q}"`,
          query: q,
          pageUrl: p,
          impressions: cur.totalImpressions,
          clicks: cur.totalClicks,
          ctr: cur.totalImpressions > 0 ? Math.round((cur.totalClicks / cur.totalImpressions) * 10000) / 10000 : 0,
          position: Math.round(curPos * 10) / 10,
          potentialImpact: clickDrop >= 50 ? 'critical' : 'high',
          priority: clickDrop >= 50 ? 'critical' : 'high',
          confidenceLevel: 'high',
          hypothesis: hasCannibalizationEvidence
            ? `Query "${q}" lost ${clickDrop} clicks (-${dropPct.toFixed(1)}%). Search Console records show ${pagesForQuery.size} different URLs competing for this query, splitting impressions and causing ranking instability.`
            : `Query "${q}" suffered a ${clickDrop} click drop (-${dropPct.toFixed(1)}%) with position slipping from ${prev.position.toFixed(1)} to ${curPos.toFixed(1)}. Content decay, competitor updates, or search intent shifts require attention.`,
          whyItMatters: `Organic traffic decay directly reduces qualified inbound leads. Catching declines early prevents irreversible ranking loss.`,
          expertExplanation: hasCannibalizationEvidence
            ? `When multiple pages on the same domain target identical keywords, Google alternates between them in the SERP, depressing overall click authority. Consolidating signals via 301 redirect or canonical tags resolves this.`
            : `Search engines favor up-to-date content that reflects current industry standards. Refreshing outdated dates, statistics, and broken links re-establishes quality signals.`,
          recommendedAction: hasCannibalizationEvidence
            ? `Consolidate competing pages into a single canonical authority page for "${q}".`
            : `Refresh ${p}: update dated references, expand analysis, and re-publish with fresh timestamp.`,
          recommendedStrategy: `SERP Health & Freshness: Restore ranking dominance by remediating content decay and eliminating internal keyword competition.`,
          implementationSteps: [
            hasCannibalizationEvidence
              ? `Review the ${pagesForQuery.size} competing URLs: ${Array.from(pagesForQuery).join(', ')}.`
              : `Review top 3 SERP competitors for "${q}" to identify newly added features or formats.`,
            `Update outdated statistics, screenshots, and broken external links on ${p}.`,
            `Add fresh analysis reflecting the current calendar year.`,
            `Request re-indexing in Google Search Console.`,
          ],
          expectedBenefit: `Reversal of -${dropPct.toFixed(1)}% decline and restoration of historical ${prev.clicks} clicks baseline.`,
          verificationMethod: `Compare 28-day performance post-refresh against previous period.`,
          evidence: {
            gscMetrics: {
              clicks: cur.totalClicks,
              impressions: cur.totalImpressions,
              ctr: cur.totalImpressions > 0 ? Math.round((cur.totalClicks / cur.totalImpressions) * 10000) / 10000 : 0,
              position: Math.round(curPos * 10) / 10,
              deltaClicks: -clickDrop,
              deltaPosition: Math.round(posWorsened * 10) / 10,
            },
            dataPoints: {
              previousClicks: prev.clicks,
              currentClicks: cur.totalClicks,
              dropPct: Math.round(dropPct * 10) / 10,
              competingUrls: Array.from(pagesForQuery),
            },
            textProof: `Period comparison: Clicks dropped from ${prev.clicks} to ${cur.totalClicks} (-${dropPct.toFixed(1)}%), position slipped by ${posWorsened.toFixed(1)}.`,
          },
          status: 'open',
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Check for GEO / AEO & AI Overviews Opportunities (Sections 6 / Categories 9 & 10)
  // Synthesized when explicitly enabled via discovery options
  // ---------------------------------------------------------------------------
  if (options.generateAiOverviewOpps || options.generateGeoAeoOpps) {
    for (const opp of opportunities.slice(0, 5)) {
      if (opp.category === 'question_keywords' || opp.category === 'serp_growth') {
        if (!opportunities.some(o => o.category === 'ai_overviews' && o.query === opp.query)) {
          opportunities.push({
            id: `opp-aio-${opp.query.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}-${Math.random().toString(36).substring(2, 6)}`,
            websiteId,
            type: 'ai_overview_readiness',
            category: 'ai_overviews',
            title: `Structure Content for AI Overviews: "${opp.query}"`,
            query: opp.query,
            pageUrl: opp.pageUrl,
            impressions: opp.impressions,
            clicks: opp.clicks,
            ctr: opp.ctr,
            position: opp.position,
            potentialImpact: 'medium',
            priority: 'medium',
            confidenceLevel: 'medium',
            hypothesis: `Query "${opp.query}" demonstrates strong informational extraction characteristics. Formatting content with direct answers, comparison tables, and structured entity definitions improves eligibility for Google AI Overviews.`,
            whyItMatters: `Google AI Overviews frequently summarize top-ranking organic documents. Clear semantic structure allows Google's LLM to quote and cite the landing page as an authority source.`,
            expertExplanation: `AI Overviews prioritize content formatted for machine readability: concise 40-word definition paragraphs, ordered process steps (<ol>), and markdown comparison tables. Important: No specific formatting guarantees AI Overview citation, but eliminating ambiguity maximizes extraction feasibility.`,
            recommendedAction: `Format the primary answer section on ${opp.pageUrl} with an ordered list, clear entity definitions, and concise factual claims.`,
            recommendedStrategy: `Google AI Overviews Optimization: Structure definitions and lists cleanly without fluff. State facts directly.`,
            implementationSteps: [
              `Add a concise, neutral 40-word summary answering "${opp.query}" directly below an H2 heading.`,
              `Use an HTML table or bulleted list for comparisons, features, or numerical data.`,
              `Include accurate entity references and definitions without excessive marketing jargon.`,
              `Verify page is fully crawlable by Googlebot and has no rendering blocks.`,
            ],
            expectedBenefit: `Enhanced visibility in Google AI Overviews and conversational answer extraction.`,
            verificationMethod: `Conduct manual SERP observation for query "${opp.query}" to inspect AI Overview citation cards.`,
            evidence: {
              gscMetrics: { clicks: opp.clicks, impressions: opp.impressions, ctr: opp.ctr, position: opp.position },
              textProof: `Query ranks at position ${opp.position} with ${opp.impressions.toLocaleString()} impressions; eligible for AI Overview extraction.`,
            },
            status: 'open',
            createdAt: new Date().toISOString(),
          });
        }
        break; // Limit to high-value representative query
      }
    }
  }

  // Sort by potential impact and impressions descending
  const impactOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return opportunities.sort((a, b) => {
    const impactDiff = (impactOrder[b.potentialImpact] || 0) - (impactOrder[a.potentialImpact] || 0);
    if (impactDiff !== 0) return impactDiff;
    return b.impressions - a.impressions;
  });
}
