import { CrawledPageData } from '../crawler/crawler';
import { AuditFinding } from '../types';
import { generateUuid } from '../utils';

export interface AeoSignals {
  questionHeadingsCount: number;
  hasFaqSchema: boolean;
  hasListFormatting: boolean;
  directAnswerReadinessScore: number;
  hasDefinitionPatterns: boolean;
}

export interface AeoAnalysisResult {
  score: number;
  findings: AuditFinding[];
  signals: AeoSignals;
}

const QUESTION_REGEX = /^(what|how|why|when|where|who|which|can|is|are|do|does|will|should)\b|\?$/i;

/**
 * Answer Engine Optimization (AEO) Evaluator
 * Evaluates readiness for conversational answer synthesis, featured snippets, and AI Overview retrieval.
 */
export function analyzeAeoSignals(
  pages: CrawledPageData[],
  websiteId: string,
  auditRunId: string,
  websiteUrl: string = 'https://example.com'
): AeoAnalysisResult {
  const findings: AuditFinding[] = [];
  let scorePoints = 100;
  const fallbackUrl = pages[0]?.url || websiteUrl;

  // 1. Question-based Headings Check
  let totalQuestionHeadings = 0;
  const pagesWithQuestions: Array<{ url: string; headings: string[] }> = [];

  for (const page of pages) {
    const allHeadings = [...page.h1Elements, ...page.h2Elements, ...page.h3Elements];
    const qHeadings = allHeadings.filter(h => QUESTION_REGEX.test(h.trim()));
    if (qHeadings.length > 0) {
      totalQuestionHeadings += qHeadings.length;
      pagesWithQuestions.push({ url: page.url, headings: qHeadings });
    }
  }

  if (totalQuestionHeadings === 0 && pages.length >= 2) {
    scorePoints -= 25;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'aeo',
      findingType: 'opportunity',
      issueType: 'missing_question_based_headings',
      severity: 'medium',
      priority: 'medium',
      confidenceLevel: 'high',
      title: 'Absence of Question-Formatted Headings for Conversational Search',
      description: 'The website headings are exclusively declarative or brand-centric. No H2 or H3 headings use conversational question phrasing (Who, What, How, Why, Can).',
      whyItMatters: 'Searchers increasingly use natural question queries. AI answer engines and snippet algorithms prioritize content with headings that explicitly match the question being asked.',
      recommendation: 'Incorporate user question patterns into section headings (e.g. "How does [Service] work?", "What are the requirements for [Feature]?").',
      implementationSteps: [
        'Identify top conversational queries using Search Console or customer inquiries.',
        'Rephrase descriptive subheadings into natural user question formats.',
        'Follow each question heading immediately with a concise 40–60 word answer paragraph.',
      ],
      verificationCriteria: 'Page contains at least one H2 or H3 heading formatted as a user question.',
      estimatedEffort: 'quick_fix',
      detectionMethod: `Inspected headings across ${pages.length} pages: 0 question-formatted headings matched pattern.`,
      evidence: {
        expected: 'Headings phrased as user search questions (e.g. "How to...", "What is...")',
        actual: '0 question-formatted headings found across crawled pages',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Direct Answer Conciseness & Definition Readiness
  // Check if content pages provide clear introductory definitions ("X is a...")
  let hasDefinitionPatterns = false;
  for (const page of pages) {
    const content = (page.mainContent || '').toLowerCase();
    if (content.includes(' is a ') || content.includes(' refers to ') || content.includes(' is defined as ')) {
      hasDefinitionPatterns = true;
      break;
    }
  }

  if (!hasDefinitionPatterns && pages.length >= 2) {
    scorePoints -= 15;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'aeo',
      findingType: 'opportunity',
      issueType: 'missing_direct_definitions',
      severity: 'low',
      priority: 'low',
      confidenceLevel: 'medium',
      title: 'Opportunity: Add Direct Topical Definitions for Entity Snippets',
      description: 'Main body copy lacks concise "X is a..." or "X refers to..." definitional sentences in early paragraphs.',
      whyItMatters: 'Conversational engines extract direct entity definitions for "What is [Topic]?" queries. Without clear definitions, algorithms synthesize alternative sources.',
      recommendation: 'Add clear, authoritative 1–2 sentence definitions at the beginning of core service and guide pages.',
      implementationSteps: [
        'Add an explicit definition sentence within the first 100 words of primary topic pages.',
        'Use direct syntax: "[Subject] is a [category] that [core function/benefit]."',
      ],
      verificationCriteria: 'Core informational pages feature an explicit introductory definition sentence.',
      estimatedEffort: 'quick_fix',
      detectionMethod: 'Content analysis: 0 standard definition patterns detected in introductory body copy.',
      evidence: {
        expected: 'Clear entity definition syntax (e.g. "[Topic] is a...") in opening paragraphs',
        actual: 'No standard introductory definitions detected in crawled copy',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 3. FAQPage Schema Check (ONLY when an FAQ page or section actually exists)
  const allSchemas = pages.flatMap(p => (p.schemas || []).filter(s => s.isValidJson !== false));
  const hasFaqSchema = allSchemas.some(s => s.type.toLowerCase().includes('faqpage'));
  const faqPage = pages.find(p => p.url.includes('/faq') || p.title.toLowerCase().includes('faq'));

  if (faqPage && !hasFaqSchema) {
    scorePoints -= 20;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: faqPage.url,
      category: 'aeo',
      findingType: 'opportunity',
      issueType: 'missing_faq_schema_on_faq_page',
      severity: 'high',
      priority: 'high',
      confidenceLevel: 'high',
      title: 'FAQ Content Present Without Schema.org FAQPage Markup',
      description: 'An FAQ page or section was detected, but it lacks Schema.org FAQPage structured data markup.',
      whyItMatters: 'FAQPage JSON-LD structures questions and answers into machine-readable pairs, enabling direct ingestion by answer engines.',
      recommendation: 'Add Schema.org FAQPage JSON-LD containing Question and acceptedAnswer objects matching visible text.',
      implementationSteps: [
        'Add a JSON-LD script block with @type: "FAQPage".',
        'Map each visible question and answer pair to Question and acceptedAnswer objects.',
        'Ensure the schema text exactly matches visible page copy.',
      ],
      verificationCriteria: 'FAQ page contains valid Schema.org FAQPage JSON-LD markup.',
      estimatedEffort: 'quick_fix',
      detectionMethod: `Page URL matches /faq pattern (${faqPage.url}) but contains 0 FAQPage schema blocks.`,
      evidence: {
        expected: 'Schema.org FAQPage JSON-LD markup matching visible questions',
        actual: '0 FAQPage structured data blocks found on FAQ page',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 4. Structured Lists & Comparative Formatting
  // Check if pages use bulleted/numbered lists for step-by-step or comparative information
  const hasListFormatting = pages.some(p => p.rawHtmlSnippet.includes('<ul') || p.rawHtmlSnippet.includes('<ol'));

  if (!hasListFormatting && pages.length >= 2) {
    scorePoints -= 10;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'aeo',
      findingType: 'opportunity',
      issueType: 'limited_structured_lists_formatting',
      severity: 'low',
      priority: 'low',
      confidenceLevel: 'medium',
      title: 'Opportunity: Structure Procedural & Comparative Content into Lists',
      description: 'The crawled sample relies heavily on wall-of-text paragraphs without bulleted lists or step-by-step numbering.',
      whyItMatters: 'Answer engines preferentially extract structured lists (<ol>, <ul>, <table>) when answering procedural "How-to" queries and comparison searches.',
      recommendation: 'Break complex processes, feature comparisons, and key takeaways into bulleted or numbered HTML lists.',
      implementationSteps: [
        'Convert step-by-step instructions into semantic <ol> ordered lists.',
        'Format feature specifications and benefits into <ul> bullet points.',
      ],
      verificationCriteria: 'Informational pages incorporate semantic HTML lists for procedural copy.',
      estimatedEffort: 'moderate',
      detectionMethod: 'DOM inspection: very low presence of <ul>/<ol> list structures across sample.',
      evidence: {
        expected: 'Semantic lists (<ol>, <ul>) for sequential steps or feature comparisons',
        actual: 'Little or no structured list formatting detected across crawled pages',
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
      hasListFormatting,
      directAnswerReadinessScore: Math.round(finalScore),
      hasDefinitionPatterns,
    },
  };
}
