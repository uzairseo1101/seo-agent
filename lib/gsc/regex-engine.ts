// RankPilot AI — Google Search Console Regular Expression & Keyword Intelligence Engine

import { GscPerformanceRow, GscKeywordAnalysisQuery, GscKeywordAnalysisPage, GscKeywordAnalysisSummary, GscKeywordAnalysisResult, BrandConfiguration } from './types';

/**
 * Standard Regex Pattern Presets conforming to Google Search Console regular expression filtering.
 */
export const GSC_REGEX_PRESETS = {
  // Section 3: Question keywords
  questions: '^(how|what|why|when|where|who|which|can|does|is|are|should)\\b',
  
  // Section 3: Informational intent
  informational: '^(how|what|why|guide|tutorial|tips|examples|meaning|benefits)\\b',
  
  // Section 3: Commercial investigation
  commercial: '(best|top|review|comparison|vs|alternative|alternatives|competitor)',
  
  // Section 3: Transactional intent
  transactional: '(buy|price|pricing|cost|purchase|order|hire|book|near me)',
} as const;

export const REGEX_SYNTAX_HELP = 
  'Supports JavaScript/RE2 regex syntax. Common patterns: ' +
  '^ (starts with), $ (ends with), | (OR logic, e.g. "pricing|cost"), ' +
  '\\b (word boundary), .* (any characters), [0-9]+ (numbers). ' +
  'Filters are evaluated case-insensitively.';

export const DATASET_SCOPE_LIMITATION_NOTE =
  'Applied exclusively to the search query records retrieved via Google Search Console API. ' +
  'Google automatically groups and omits very low-volume long-tail queries to protect user privacy. ' +
  'Regex filtering evaluates the captured Search Console dataset and cannot retrieve unrecorded search volume.';

/**
 * Validates a regular expression safely without throwing runtime crashes.
 */
export function validateRegex(pattern: string): { isValid: boolean; regex?: RegExp; error?: string } {
  if (!pattern || pattern.trim() === '') {
    return { isValid: false, error: 'Regex expression cannot be empty.' };
  }

  try {
    const trimmed = pattern.trim();
    // Enforce case-insensitive matching by default
    const regex = new RegExp(trimmed, 'i');
    return { isValid: true, regex };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Invalid regular expression syntax: ${err.message || 'Syntax error'}. Check unclosed brackets, parentheses, or escaping.`,
    };
  }
}

/**
 * Builds a regex pattern for brand names safely escaping special characters.
 */
export function buildBrandRegex(brandNames: string[]): RegExp | null {
  const cleaned = brandNames
    .map(b => b.trim())
    .filter(b => b.length > 0);

  if (cleaned.length === 0) return null;

  const escaped = cleaned.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(${escaped.join('|')})\\b`, 'i');
}

/**
 * Position-aware Expected CTR Benchmark.
 * Reflects real-world organic Google SERP CTR curves across positions 1 to 20+.
 */
export function getPositionCtrBenchmark(position: number): number {
  if (position <= 1.2) return 0.28; // ~28%
  if (position <= 2.0) return 0.16; // ~16%
  if (position <= 3.0) return 0.10; // ~10%
  if (position <= 4.0) return 0.07; // ~7%
  if (position <= 5.0) return 0.05; // ~5%
  if (position <= 8.0) return 0.03; // ~3%
  if (position <= 10.0) return 0.02; // ~2%
  if (position <= 15.0) return 0.012; // ~1.2%
  if (position <= 20.0) return 0.007; // ~0.7%
  return 0.003; // ~0.3% for position > 20
}

/**
 * Classifies search intent and entity characteristics of an organic query.
 */
export function classifySearchIntent(
  query: string,
  brandConfig?: BrandConfiguration
): {
  intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
  isQuestion: boolean;
  isBranded: boolean;
  isCompetitor: boolean;
  isLongTail: boolean;
  matchedPattern?: string;
} {
  const q = query.trim().toLowerCase();

  // 1. Check Brand & Competitor
  let isBranded = false;
  let isCompetitor = false;

  if (brandConfig?.brandNames && brandConfig.brandNames.length > 0) {
    const brandRegex = buildBrandRegex(brandConfig.brandNames);
    if (brandRegex && brandRegex.test(q)) {
      isBranded = true;
    }
  }

  if (brandConfig?.competitorNames && brandConfig.competitorNames.length > 0) {
    const compRegex = buildBrandRegex(brandConfig.competitorNames);
    if (compRegex && compRegex.test(q)) {
      isCompetitor = true;
    }
  }

  // 2. Check Question Patterns (Section 3 & 4.E)
  const questionRegex = new RegExp(GSC_REGEX_PRESETS.questions, 'i');
  const isQuestion = questionRegex.test(q) || q.includes('?') || /\b(can i|how to|what is|how do|why is|difference between)\b/i.test(q);

  // 3. Check Long-Tail (Section 4.F: 4+ words or >= 25 characters)
  const wordCount = q.split(/\s+/).filter(Boolean).length;
  const isLongTail = wordCount >= 4;

  // 4. Intent Classification
  const transactionalRegex = new RegExp(GSC_REGEX_PRESETS.transactional, 'i');
  const commercialRegex = new RegExp(GSC_REGEX_PRESETS.commercial, 'i');
  const informationalRegex = new RegExp(GSC_REGEX_PRESETS.informational, 'i');

  let intent: 'informational' | 'commercial' | 'transactional' | 'navigational' = 'informational';
  let matchedPattern: string | undefined = undefined;

  if (isBranded && wordCount <= 3 && !commercialRegex.test(q) && !transactionalRegex.test(q)) {
    intent = 'navigational';
    matchedPattern = 'branded_navigational';
  } else if (transactionalRegex.test(q)) {
    intent = 'transactional';
    matchedPattern = GSC_REGEX_PRESETS.transactional;
  } else if (commercialRegex.test(q) || isCompetitor) {
    intent = 'commercial';
    matchedPattern = GSC_REGEX_PRESETS.commercial;
  } else if (isQuestion || informationalRegex.test(q)) {
    intent = 'informational';
    matchedPattern = GSC_REGEX_PRESETS.questions;
  }

  return {
    intent,
    isQuestion,
    isBranded,
    isCompetitor,
    isLongTail,
    matchedPattern,
  };
}

export interface AnalyzeKeywordsOptions {
  customRegex?: string;
  presetFilter?: 'all' | 'questions' | 'informational' | 'commercial' | 'transactional' | 'branded' | 'non_branded';
  brandConfig?: BrandConfiguration;
  minImpressions?: number;
  minClicks?: number;
  zeroClicksOnly?: boolean;
  pageFilter?: string;
  positionBracket?: 'all' | 'top3' | 'striking_distance' | 'page2_plus';
}

/**
 * Executes high-performance keyword and regular expression analysis across GSC performance records.
 */
export function analyzeGscKeywords(
  rows: GscPerformanceRow[],
  options: AnalyzeKeywordsOptions = {}
): GscKeywordAnalysisResult {
  // Aggregate rows by query
  const queryMap = new Map<string, {
    query: string;
    totalClicks: number;
    totalImpressions: number;
    weightedPosSum: number;
    pages: Set<string>;
    pageClicks: Map<string, number>;
  }>();

  // Aggregate rows by landing page
  const pageMap = new Map<string, {
    pageUrl: string;
    totalClicks: number;
    totalImpressions: number;
    weightedPosSum: number;
    queries: Set<string>;
  }>();

  let globalClicks = 0;
  let globalImpressions = 0;

  for (const row of rows) {
    const qKey = row.query.trim().toLowerCase();
    const pKey = row.page.trim();

    globalClicks += row.clicks;
    globalImpressions += row.impressions;

    // Aggregate Query
    const existingQ = queryMap.get(qKey) || {
      query: row.query.trim(),
      totalClicks: 0,
      totalImpressions: 0,
      weightedPosSum: 0,
      pages: new Set<string>(),
      pageClicks: new Map<string, number>(),
    };
    existingQ.totalClicks += row.clicks;
    existingQ.totalImpressions += row.impressions;
    existingQ.weightedPosSum += row.position * row.impressions;
    existingQ.pages.add(pKey);
    existingQ.pageClicks.set(pKey, (existingQ.pageClicks.get(pKey) || 0) + row.clicks);
    queryMap.set(qKey, existingQ);

    // Aggregate Page
    const existingP = pageMap.get(pKey) || {
      pageUrl: pKey,
      totalClicks: 0,
      totalImpressions: 0,
      weightedPosSum: 0,
      queries: new Set<string>(),
    };
    existingP.totalClicks += row.clicks;
    existingP.totalImpressions += row.impressions;
    existingP.weightedPosSum += row.position * row.impressions;
    existingP.queries.add(row.query.trim());
    pageMap.set(pKey, existingP);
  }

  // Determine Active Regex Filter
  let activeRegex: RegExp | null = null;
  let regexValidationError: string | undefined = undefined;
  let patternUsed: string | undefined = undefined;

  if (options.customRegex && options.customRegex.trim() !== '') {
    patternUsed = options.customRegex.trim();
    const val = validateRegex(patternUsed);
    if (val.isValid && val.regex) {
      activeRegex = val.regex;
    } else {
      regexValidationError = val.error;
    }
  } else if (options.presetFilter && options.presetFilter !== 'all') {
    if (options.presetFilter === 'questions') {
      patternUsed = GSC_REGEX_PRESETS.questions;
      activeRegex = new RegExp(patternUsed, 'i');
    } else if (options.presetFilter === 'informational') {
      patternUsed = GSC_REGEX_PRESETS.informational;
      activeRegex = new RegExp(patternUsed, 'i');
    } else if (options.presetFilter === 'commercial') {
      patternUsed = GSC_REGEX_PRESETS.commercial;
      activeRegex = new RegExp(patternUsed, 'i');
    } else if (options.presetFilter === 'transactional') {
      patternUsed = GSC_REGEX_PRESETS.transactional;
      activeRegex = new RegExp(patternUsed, 'i');
    }
  }

  // Brand Regex
  const brandRegex = options.brandConfig?.brandNames?.length
    ? buildBrandRegex(options.brandConfig.brandNames)
    : null;

  // Process and Filter Queries
  const analyzedQueries: GscKeywordAnalysisQuery[] = [];
  let brandedClicks = 0;
  let nonBrandedClicks = 0;
  let questionsCount = 0;
  let zeroClickCount = 0;
  let strikingDistanceCount = 0;

  for (const [, agg] of queryMap.entries()) {
    const avgPos = agg.totalImpressions > 0
      ? Math.round((agg.weightedPosSum / agg.totalImpressions) * 10) / 10
      : 0;
    const ctr = agg.totalImpressions > 0
      ? Math.round((agg.totalClicks / agg.totalImpressions) * 10000) / 10000
      : 0;

    const classification = classifySearchIntent(agg.query, options.brandConfig);

    // Track statistics for entire dataset
    if (classification.isBranded) {
      brandedClicks += agg.totalClicks;
    } else {
      nonBrandedClicks += agg.totalClicks;
    }

    if (classification.isQuestion) {
      questionsCount++;
    }

    if (agg.totalClicks === 0 && agg.totalImpressions >= 20) {
      zeroClickCount++;
    }

    if (avgPos >= 4.0 && avgPos <= 20.0 && agg.totalImpressions >= 50) {
      strikingDistanceCount++;
    }

    // Determine Position Bracket & CTR Benchmark
    let positionBracket: GscKeywordAnalysisQuery['positionBracket'] = 'pos_21_plus';
    if (avgPos <= 3.0) positionBracket = 'pos_1_3';
    else if (avgPos <= 10.0) positionBracket = 'pos_4_10';
    else if (avgPos <= 20.0) positionBracket = 'pos_11_20';

    const benchmarkCtr = getPositionCtrBenchmark(avgPos);
    let ctrHealth: GscKeywordAnalysisQuery['ctrHealth'] = 'average';
    if (ctr >= benchmarkCtr * 1.25) {
      ctrHealth = 'strong';
    } else if (ctr < benchmarkCtr * 0.6) {
      ctrHealth = 'underperforming';
    }

    // Find top landing page
    let topPage = '';
    let maxPageClicks = -1;
    for (const [p, c] of agg.pageClicks.entries()) {
      if (c > maxPageClicks) {
        maxPageClicks = c;
        topPage = p;
      }
    }
    if (!topPage && agg.pages.size > 0) {
      topPage = Array.from(agg.pages)[0];
    }

    // Evaluate Filters
    if (options.minImpressions !== undefined && agg.totalImpressions < options.minImpressions) {
      continue;
    }
    if (options.minClicks !== undefined && agg.totalClicks < options.minClicks) {
      continue;
    }
    if (options.zeroClicksOnly && agg.totalClicks > 0) {
      continue;
    }
    if (options.pageFilter && !Array.from(agg.pages).some(p => p.toLowerCase().includes(options.pageFilter!.toLowerCase()))) {
      continue;
    }

    // Position Bracket Filter
    if (options.positionBracket === 'top3' && avgPos > 3.0) continue;
    if (options.positionBracket === 'striking_distance' && (avgPos < 4.0 || avgPos > 20.0)) continue;
    if (options.positionBracket === 'page2_plus' && avgPos <= 10.0) continue;

    // Brand Preset Filter
    if (options.presetFilter === 'branded') {
      if (!classification.isBranded) continue;
    } else if (options.presetFilter === 'non_branded') {
      if (classification.isBranded) continue;
    }

    // Regex Matching
    if (activeRegex && !activeRegex.test(agg.query)) {
      continue;
    }

    analyzedQueries.push({
      query: agg.query,
      topPage,
      pages: Array.from(agg.pages),
      clicks: agg.totalClicks,
      impressions: agg.totalImpressions,
      ctr,
      position: avgPos,
      intent: classification.intent,
      isQuestion: classification.isQuestion,
      isBranded: classification.isBranded,
      isCompetitor: classification.isCompetitor,
      isLongTail: classification.isLongTail,
      matchedPattern: classification.matchedPattern,
      positionBracket,
      expectedCtrBenchmark: benchmarkCtr,
      ctrHealth,
    });
  }

  // Sort queries: clicks descending, then impressions descending
  analyzedQueries.sort((a, b) => b.clicks !== a.clicks ? b.clicks - a.clicks : b.impressions - a.impressions);

  // Analyze Pages
  const analyzedPages: GscKeywordAnalysisPage[] = Array.from(pageMap.values()).map(p => {
    const avgPos = p.totalImpressions > 0
      ? Math.round((p.weightedPosSum / p.totalImpressions) * 10) / 10
      : 0;
    const ctr = p.totalImpressions > 0
      ? Math.round((p.totalClicks / p.totalImpressions) * 10000) / 10000
      : 0;

    return {
      pageUrl: p.pageUrl,
      clicks: p.totalClicks,
      impressions: p.totalImpressions,
      ctr,
      avgPosition: avgPos,
      topQueries: Array.from(p.queries).slice(0, 5),
      queryCount: p.queries.size,
    };
  }).sort((a, b) => b.clicks - a.clicks);

  // Calculate Summary Statistics
  const totalQueries = queryMap.size;
  const filteredQueries = analyzedQueries.length;
  const totalClicksSum = analyzedQueries.reduce((sum, q) => sum + q.clicks, 0);
  const totalImpSum = analyzedQueries.reduce((sum, q) => sum + q.impressions, 0);
  const avgFilteredCtr = totalImpSum > 0 ? Math.round((totalClicksSum / totalImpSum) * 10000) / 10000 : 0;
  const avgFilteredPos = analyzedQueries.length > 0
    ? Math.round((analyzedQueries.reduce((sum, q) => sum + q.position, 0) / analyzedQueries.length) * 10) / 10
    : 0;

  const totalOverallClicks = Math.max(1, globalClicks);
  const brandedClicksPct = Math.round((brandedClicks / totalOverallClicks) * 1000) / 10;
  const nonBrandedClicksPct = Math.round((nonBrandedClicks / totalOverallClicks) * 1000) / 10;

  const summary: GscKeywordAnalysisSummary = {
    totalQueries,
    filteredQueries,
    totalClicks: totalClicksSum,
    totalImpressions: totalImpSum,
    avgCtr: avgFilteredCtr,
    avgPosition: avgFilteredPos,
    brandedClicks,
    nonBrandedClicks,
    brandedClicksPct,
    nonBrandedClicksPct,
    questionsCount,
    zeroClickCount,
    strikingDistanceCount,
    datasetScopeNote: DATASET_SCOPE_LIMITATION_NOTE,
  };

  return {
    queries: analyzedQueries,
    pages: analyzedPages,
    summary,
    regexValidation: {
      isValid: !regexValidationError,
      patternUsed,
      errorMessage: regexValidationError,
      syntaxHelp: REGEX_SYNTAX_HELP,
    },
  };
}
