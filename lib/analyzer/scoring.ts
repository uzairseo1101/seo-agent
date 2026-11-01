import { AuditFinding } from '../types';

export interface ScoreBreakdown {
  overallSeoScore: number;
  geoScore: number;
  aeoScore: number;
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
  };
  formulaExplanation: string;
}

export function calculateAuditScores(
  findings: AuditFinding[],
  geoScore: number,
  aeoScore: number
): ScoreBreakdown {
  const technicalFindings = findings.filter(f => f.category === 'technical');
  const contentFindings = findings.filter(f => f.category === 'content');
  const indexabilityFindings = findings.filter(f => f.category === 'indexability');

  const calcCategoryScore = (items: AuditFinding[]): number => {
    let score = 100;
    for (const f of items) {
      if (f.severity === 'critical') score -= 15;
      else if (f.severity === 'high') score -= 8;
      else if (f.severity === 'medium') score -= 4;
      else if (f.severity === 'low') score -= 1.5;
    }
    return Math.max(10, Math.min(100, Math.round(score * 10) / 10));
  };

  const technicalScore = calcCategoryScore(technicalFindings);
  const contentScore = calcCategoryScore(contentFindings);
  const indexabilityScore = calcCategoryScore(indexabilityFindings);

  // Overall SEO is weighted: 45% Technical, 30% Indexability, 25% Content
  const overallSeoScore = Math.round(
    (technicalScore * 0.45 + indexabilityScore * 0.30 + contentScore * 0.25) * 10
  ) / 10;

  return {
    overallSeoScore,
    geoScore: Math.round(geoScore * 10) / 10,
    aeoScore: Math.round(aeoScore * 10) / 10,
    categoryScores: {
      technical: technicalScore,
      content: contentScore,
      indexability: indexabilityScore,
      geo: geoScore,
      aeo: aeoScore,
    },
    weights: {
      criticalDeduction: 15,
      highDeduction: 8,
      mediumDeduction: 4,
      lowDeduction: 1.5,
    },
    formulaExplanation: 'Base score 100 with transparent deductions: Critical (-15), High (-8), Medium (-4), Low (-1.5). SEO Overall = 45% Technical + 30% Indexability + 25% On-Page Content.',
  };
}
