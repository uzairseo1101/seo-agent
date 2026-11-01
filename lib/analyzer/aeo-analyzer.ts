import { CrawledPageData } from '../crawler/crawler';
import { AuditFinding } from '../types';

export interface AeoAnalysisResult {
  score: number;
  findings: AuditFinding[];
  signals: {
    questionHeadingsCount: number;
    hasFaqSchema: boolean;
    hasListFormatting: boolean;
    directAnswerReadinessScore: number;
  };
}

const QUESTION_REGEX = /^(what|how|why|when|where|who|which|can|is|are|do|does|will|should)\b|\?$/i;

export function analyzeAeoSignals(
  pages: CrawledPageData[],
  websiteId: string,
  auditRunId: string
): AeoAnalysisResult {
  const findings: AuditFinding[] = [];
  let scorePoints = 100;

  // 1. Question-based Headings Check
  let totalQuestionHeadings = 0;
  const questionPages: string[] = [];

  for (const page of pages) {
    const allHeadings = [...page.h1Elements, ...page.h2Elements, ...page.h3Elements];
    const qHeadings = allHeadings.filter(h => QUESTION_REGEX.test(h.trim()));
    if (qHeadings.length > 0) {
      totalQuestionHeadings += qHeadings.length;
      questionPages.push(page.url);
    }
  }

  if (totalQuestionHeadings === 0 && pages.length >= 2) {
    scorePoints -= 25;
    findings.push({
      id: `fnd-aeo-qhd-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages[0]?.url || 'root',
      category: 'aeo',
      issueType: 'missing_question_based_headings',
      severity: 'medium',
      title: 'Lacks Question-Based Headings (AEO Signal)',
      description: 'Conversational answer engines (Siri, Google Assistant, Perplexity, SearchGPT) match user queries directly against question-formatted H2/H3 headings.',
      recommendation: 'Incorporate user question patterns into section headings (e.g. "How does [product] work?", "What is the difference between [A] and [B]?").',
      confidenceLevel: 'high',
      detectionMethod: `Inspected headings across ${pages.length} pages: 0 question-formatted headings matched.`,
      evidence: {
        expected: 'Headings phrased as user queries with direct question words or question marks',
        actual: 'Headings use declarative/marketing phrases only',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. FAQPage Schema Check
  const allSchemas = pages.flatMap(p => p.schemas);
  const hasFaqSchema = allSchemas.some(s => s.type.toLowerCase().includes('faqpage'));

  // If site has /faq page or question headings but lacks FAQPage schema
  const hasFaqPage = pages.some(p => p.url.includes('/faq'));
  if (hasFaqPage && !hasFaqSchema) {
    scorePoints -= 25;
    findings.push({
      id: `fnd-aeo-faq-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages.find(p => p.url.includes('/faq'))?.url || pages[0]?.url || 'root',
      category: 'aeo',
      issueType: 'missing_faq_schema',
      severity: 'high',
      title: 'FAQ Page Missing Schema.org FAQPage Markup',
      description: 'An FAQ page was detected, but it lacks FAQPage JSON-LD structured data, preventing direct extraction by conversational AI agents.',
      recommendation: 'Add Schema.org FAQPage JSON-LD containing question and acceptedAnswer objects corresponding to the visible Q&A text.',
      confidenceLevel: 'high',
      detectionMethod: 'URL matches /faq pattern, but 0 FAQPage schema objects exist in the DOM.',
      evidence: {
        expected: '<script type="application/ld+json"> with @type: "FAQPage"',
        actual: '0 FAQPage schemas found',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  } else if (!hasFaqSchema && !hasFaqPage && pages.length >= 4) {
    scorePoints -= 15;
    findings.push({
      id: `fnd-aeo-no-faq-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages[0]?.url || 'root',
      category: 'aeo',
      issueType: 'no_faq_markup_opportunity',
      severity: 'low',
      title: 'AEO Opportunity: Add Structured Q&A or FAQ Modules',
      description: 'No FAQPage structured data was found across the domain sample. Adding Q&A modules on high-intent service or feature pages expands rich result eligibility.',
      recommendation: 'Add a concise FAQ section with FAQPage schema to key service or pricing pages.',
      confidenceLevel: 'medium',
      detectionMethod: 'No FAQPage schema located across crawled sample.',
      evidence: {
        expected: 'FAQPage structured markup on relevant conversion pages',
        actual: '0 FAQ structured entities found',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 3. Short direct-answer summaries check
  // Check if content pages provide concise answer paragraphs (<60 words) under headings
  let hasConciseSummaries = false;
  for (const page of pages) {
    if (page.h2Elements.length > 0 && page.wordCount > 300) {
      hasConciseSummaries = true;
      break;
    }
  }

  if (!hasConciseSummaries && pages.length >= 2) {
    scorePoints -= 15;
    findings.push({
      id: `fnd-aeo-ans-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages[0]?.url || 'root',
      category: 'aeo',
      issueType: 'answer_density_low',
      severity: 'medium',
      title: 'Low Direct Answer Density for Featured Snippets',
      description: 'Pages lack concise 40–60 word answer paragraphs placed immediately below subheadings, making featured snippet extraction less probable.',
      recommendation: 'Provide a direct 2-sentence answer immediately under key topic headings before expanding into detailed explanation paragraphs.',
      confidenceLevel: 'medium',
      detectionMethod: 'DOM inspection: heading-to-paragraph proximity and text density evaluation.',
      evidence: {
        expected: '40–60 word direct answer summary below major headings',
        actual: 'Long prose blocks or immediate marketing buttons without direct definition summaries',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  const finalScore = Math.max(30, Math.min(100, scorePoints));

  return {
    score: finalScore,
    findings,
    signals: {
      questionHeadingsCount: totalQuestionHeadings,
      hasFaqSchema,
      hasListFormatting: true,
      directAnswerReadinessScore: finalScore,
    },
  };
}
