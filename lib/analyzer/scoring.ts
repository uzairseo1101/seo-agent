import { AuditFinding } from '../types';

export interface ScoreCategoryBreakdown {
  category: string;
  score: number;
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  deductions: number;
}

export interface ScoreBreakdown {
  overallSeoScore: number;
  technicalScore: number;
  geoScore: number;
  aeoScore: number;
  isProvisionalScore: boolean;
  provisionalReason?: string;
  categoryScores: {
    technical: number;
    content: number;
    indexability: number;
    geo: number;
    aeo: number;
  };
  weights: {
    criticalDeduction: number;
    highDeduction: number;
    mediumDeduction: number;
    lowDeduction: number;
    noticeDeduction: number;
  };
  scoringVersion: string;
  formulaExplanation: string;
  categories: Record<string, ScoreCategoryBreakdown>;
}

/**
 * Deterministic Scoring Engine (Version 2.0)
 *
 * Scoring Principles:
 * 1. Base category score starts at 100.
 * 2. Deductions by severity: Critical (-15), High (-8), Medium (-4), Low (-1.5), Notice (-0.5).
 * 3. Duplicate Prevention: Multiple occurrences of the same issueType do not multiply
 *    the full penalty linearly. The first occurrence takes the primary penalty, and
 *    subsequent instances add a diminished penalty (20% of base, capped at 2.0x base penalty).
 * 4. Four independent scores: SEO (/100), Technical SEO (/100), GEO (/100), AEO (/100).
 * 5. If crawl coverage is insufficient (< 3 crawled pages), scores are flagged as Provisional.
 */
export function calculateAuditScores(
  findings: AuditFinding[],
  geoScore: number,
  aeoScore: number,
  pagesCrawled: number = 5,
  discoveredUrlsCount: number = 5
): ScoreBreakdown {
  const isProvisionalScore = pagesCrawled < 3;
  const provisionalReason = isProvisionalScore
    ? `Provisional score: crawl sample (${pagesCrawled} pages) represents limited site coverage.`
    : undefined;

  // Severity penalty table
  const BASE_PENALTIES: Record<string, number> = {
    critical: 15,
    high: 8,
    medium: 4,
    low: 1.5,
    notice: 0.5,
    info: 0.5,
  };

  /**
   * Calculates category score with non-linear deduplicated issue penalties
   */
  const calculateCategory = (categoryFindings: AuditFinding[], categoryName: string): ScoreCategoryBreakdown => {
    // Group by issueType to prevent linear penalty multiplication for duplicate errors
    const issueGroups = new Map<string, AuditFinding[]>();
    for (const f of categoryFindings) {
      const group = issueGroups.get(f.issueType) || [];
      group.push(f);
      issueGroups.set(f.issueType, group);
    }

    let totalDeductions = 0;
    for (const [_, items] of issueGroups.entries()) {
      const primary = items[0];
      const baseDeduction = BASE_PENALTIES[primary.severity] || 3;
      const duplicateCount = items.length - 1;

      // Primary occurrence + diminished increment for repeated instances (capped at 2x base)
      const groupDeduction = Math.min(
        baseDeduction + duplicateCount * (baseDeduction * 0.2),
        baseDeduction * 2.0
      );
      totalDeductions += groupDeduction;
    }

    const calculatedScore = Math.max(10, Math.min(100, Math.round((100 - totalDeductions) * 10) / 10));

    return {
      category: categoryName,
      score: calculatedScore,
      totalIssues: categoryFindings.length,
      criticalCount: categoryFindings.filter(f => f.severity === 'critical').length,
      highCount: categoryFindings.filter(f => f.severity === 'high').length,
      mediumCount: categoryFindings.filter(f => f.severity === 'medium').length,
      lowCount: categoryFindings.filter(f => f.severity === 'low' || f.severity === 'info' || f.severity === 'notice').length,
      deductions: Math.round(totalDeductions * 10) / 10,
    };
  };

  const technicalFindings = findings.filter(f => f.category === 'technical');
  const contentFindings = findings.filter(f => f.category === 'content');
  const indexabilityFindings = findings.filter(f => f.category === 'indexability');

  const techBreakdown = calculateCategory(technicalFindings, 'technical');
  const contentBreakdown = calculateCategory(contentFindings, 'content');
  const indexBreakdown = calculateCategory(indexabilityFindings, 'indexability');

  // Technical SEO Score is independent
  const technicalScore = techBreakdown.score;

  // Overall SEO Health is a weighted composite of Technical, Indexability, and On-Page Content
  const overallSeoScore = Math.round(
    (techBreakdown.score * 0.45 + indexBreakdown.score * 0.30 + contentBreakdown.score * 0.25) * 10
  ) / 10;

  const boundedGeo = Math.max(10, Math.min(100, Math.round(geoScore * 10) / 10));
  const boundedAeo = Math.max(10, Math.min(100, Math.round(aeoScore * 10) / 10));

  return {
    overallSeoScore,
    technicalScore,
    geoScore: boundedGeo,
    aeoScore: boundedAeo,
    isProvisionalScore,
    provisionalReason,
    categoryScores: {
      technical: technicalScore,
      content: contentBreakdown.score,
      indexability: indexBreakdown.score,
      geo: boundedGeo,
      aeo: boundedAeo,
    },
    weights: {
      criticalDeduction: 15,
      highDeduction: 8,
      mediumDeduction: 4,
      lowDeduction: 1.5,
      noticeDeduction: 0.5,
    },
    scoringVersion: '2.0',
    formulaExplanation: 'Base score 100 with deduplicated severity penalties: Critical (-15), High (-8), Medium (-4), Low (-1.5). Duplicate findings use diminished scaling (max 2.0x base penalty). SEO Score = 45% Technical + 30% Indexability + 25% Content.',
    categories: {
      technical: techBreakdown,
      content: contentBreakdown,
      indexability: indexBreakdown,
    },
  };
}
