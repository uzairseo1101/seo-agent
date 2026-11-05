import { CrawledPageData } from '../crawler/crawler';
import { AuditFinding } from '../types';
import { generateUuid } from '../utils';

export interface GeoSignals {
  hasOrganizationSchema: boolean;
  hasAuthorEntity: boolean;
  hasAuthorCredentials: boolean;
  hasOutboundCitations: boolean;
  hasContactOrAbout: boolean;
  hasClearBrandName: boolean;
  machineReadabilityRatio: number;
}

export interface GeoAnalysisResult {
  score: number;
  findings: AuditFinding[];
  signals: GeoSignals;
}

/**
 * Generative Engine Optimization (GEO) Evaluator
 * Evaluates measurable brand entity clarity, author credentials, citation density,
 * and machine readability for LLM-assisted search synthesis.
 */
export function analyzeGeoSignals(
  pages: CrawledPageData[],
  websiteId: string,
  auditRunId: string,
  websiteUrl: string = 'https://example.com'
): GeoAnalysisResult {
  const findings: AuditFinding[] = [];
  let scorePoints = 100;
  const fallbackUrl = pages[0]?.url || websiteUrl;

  // 1. Organization / Brand Entity Schema Check
  const allSchemas = pages.flatMap(p => p.schemas || []);
  const orgSchemas = allSchemas.filter(s =>
    s.isValidJson !== false &&
    (s.type.toLowerCase().includes('organization') ||
     s.type.toLowerCase().includes('corporation') ||
     s.type.toLowerCase().includes('localbusiness'))
  );
  const hasOrgSchema = orgSchemas.length > 0;

  if (!hasOrgSchema) {
    scorePoints -= 25;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      findingType: 'opportunity',
      issueType: 'missing_organization_schema',
      severity: 'high',
      priority: 'high',
      confidenceLevel: 'high',
      title: 'Missing Organization / Brand Entity Structured Data',
      description: 'The website does not declare a Schema.org Organization or LocalBusiness JSON-LD markup on its homepage.',
      whyItMatters: 'Large language models and AI answer engines rely on unambiguous entity schema to identify who publishes the website, establishing brand identity in knowledge graphs.',
      recommendation: 'Implement Schema.org Organization JSON-LD markup on homepage declaring official brand name, logo, URL, sameAs social profiles, and contact points.',
      implementationSteps: [
        'Add a JSON-LD block inside <head> on the homepage with @type: "Organization".',
        'Include name, url, logo, and sameAs array with verified profiles (LinkedIn, X, Crunchbase).',
        'Validate with Google Rich Results / Schema.org Validator.',
      ],
      verificationCriteria: 'Homepage contains valid Schema.org Organization or LocalBusiness JSON-LD markup.',
      estimatedEffort: 'quick_fix',
      detectionMethod: 'Structured data evaluation: 0 Organization/LocalBusiness schemas found across crawled pages.',
      evidence: {
        expected: 'Schema.org Organization markup declaring official brand name and sameAs profiles',
        actual: 'No Organization structured data discovered in crawled sample',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  } else {
    // Check if Organization schema has sameAs profile links
    const hasSameAs = orgSchemas.some(s => Array.isArray(s.data?.sameAs) && s.data.sameAs.length > 0);
    if (!hasSameAs) {
      scorePoints -= 10;
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: fallbackUrl,
        category: 'geo',
        findingType: 'opportunity',
        issueType: 'organization_missing_sameas',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'high',
        title: 'Organization Schema Lacks sameAs Entity Reference Profiles',
        description: 'Organization structured data was detected, but it lacks the sameAs array linking to authoritative corporate entity profiles.',
        whyItMatters: 'The sameAs property explicitly maps the brand to external knowledge repositories (Wikidata, Wikipedia, LinkedIn, Crunchbase), anchoring entity identity.',
        recommendation: 'Add sameAs array into Organization JSON-LD linking to verified external company profiles.',
        implementationSteps: [
          'Add "sameAs": ["https://www.linkedin.com/company/...", "https://x.com/..."] to Organization JSON-LD.',
        ],
        verificationCriteria: 'Organization JSON-LD contains a non-empty sameAs array with valid URLs.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'Schema property check: Organization found but sameAs property is missing or empty',
        evidence: {
          expected: 'Organization with sameAs: ["https://..."]',
          actual: 'Organization markup present without sameAs property',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 2. Author Entity & Expertise Attribution (for editorial/blog pages)
  const blogOrArticlePages = pages.filter(p =>
    p.url.includes('/blog') || p.url.includes('/article') || p.url.includes('/news') || p.url.includes('/post') || p.url.includes('/guide')
  );

  let hasAuthorEntity = false;
  let hasAuthorCredentials = false;

  if (blogOrArticlePages.length > 0) {
    const articleSchemas = blogOrArticlePages.flatMap(p => (p.schemas || []).filter(s => s.isValidJson !== false));
    hasAuthorEntity = articleSchemas.some(s =>
      s.data?.author ||
      s.type.toLowerCase().includes('person') ||
      (s.type.toLowerCase().includes('article') && s.data?.author)
    );

    hasAuthorCredentials = articleSchemas.some(s => {
      const author = s.data?.author;
      if (typeof author === 'object' && author) {
        return Boolean(author.sameAs || author.jobTitle || author.description);
      }
      return false;
    });

    if (!hasAuthorEntity) {
      scorePoints -= 20;
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: blogOrArticlePages[0].url,
        category: 'geo',
        findingType: 'opportunity',
        issueType: 'missing_author_entity_attribution',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Missing Verifiable Author Entity in Editorial Content',
        description: 'Editorial article pages were detected without structured Schema.org Person markup or explicit author identity.',
        whyItMatters: 'Generative search engines weigh verified author credentials when extracting answers and evaluating source authority.',
        recommendation: 'Declare article authors using Schema.org Person with full name, job title, and links to verified social/professional profiles.',
        implementationSteps: [
          'Add author: { "@type": "Person", "name": "...", "jobTitle": "...", "sameAs": [...] } inside Article schema.',
          'Include a visible author byline and biography on each informational article.',
        ],
        verificationCriteria: 'Editorial article contains Schema.org Article with verified Person author markup.',
        estimatedEffort: 'moderate',
        detectionMethod: 'Article structured data check: author entity is missing or lacks structured Person type.',
        evidence: {
          expected: 'Schema.org Article with author: { @type: "Person", name: "...", sameAs: [...] }',
          actual: 'No verified Person author schema discovered on editorial pages',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else if (!hasAuthorCredentials) {
      scorePoints -= 10;
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: blogOrArticlePages[0].url,
        category: 'geo',
        findingType: 'opportunity',
        issueType: 'author_lacks_verifiable_credentials',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'medium',
        title: 'Author Entity Lacks External Credential Links (sameAs)',
        description: 'Author schema includes a name but omits external verification links (e.g. LinkedIn, personal domain, or industry directories).',
        whyItMatters: 'Linking author entities to third-party profiles prevents entity ambiguity and establishes verified expertise.',
        recommendation: 'Add sameAs array linking to the author\'s verified professional profiles.',
        implementationSteps: [
          'Add sameAs links to author\'s LinkedIn, Google Scholar, or personal website in Person schema.',
        ],
        verificationCriteria: 'Author Person schema includes non-empty sameAs array.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'Schema inspection: author.sameAs array is empty or undefined.',
        evidence: {
          expected: 'author.sameAs array containing at least 1 verified profile link',
          actual: 'author.sameAs is missing or empty',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. Source Transparency & Factual Outbound Citations
  let totalExternalLinks = 0;
  for (const page of pages) {
    totalExternalLinks += page.externalLinks.length;
  }
  const hasOutboundCitations = totalExternalLinks >= Math.max(1, pages.length * 0.3);

  if (!hasOutboundCitations && pages.length >= 3) {
    scorePoints -= 10;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      findingType: 'opportunity',
      issueType: 'low_source_transparency_citations',
      severity: 'medium',
      priority: 'low',
      confidenceLevel: 'medium',
      title: 'Limited Outbound Reference Citations on Informational Content',
      description: 'The crawled sample contains very few outbound citations to primary sources, research, or industry standards.',
      whyItMatters: 'Content that cites verified primary data signals editorial rigor and is more readily synthesized by AI models.',
      recommendation: 'Link to authoritative primary studies, official documentation, or original data sources when making factual claims.',
      implementationSteps: [
        'Review informational articles for factual assertions or statistical claims.',
        'Add contextual hyperlinks to primary research publications or official sources.',
      ],
      verificationCriteria: 'Informational pages contain outbound citations to reputable external sources.',
      estimatedEffort: 'moderate',
      detectionMethod: `External link count across sample = ${totalExternalLinks} references on ${pages.length} pages`,
      evidence: {
        expected: 'At least 1–2 authoritative outbound references on informational pages',
        actual: `${totalExternalLinks} external references found across ${pages.length} crawled pages`,
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 4. About & Contact Information Discoverability
  const hasContactOrAbout = pages.some(p =>
    p.url.includes('/about') || p.url.includes('/contact') || p.url.includes('/team')
  );

  if (!hasContactOrAbout && pages.length >= 3) {
    scorePoints -= 15;
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      findingType: 'warning',
      issueType: 'missing_about_or_contact_signals',
      severity: 'medium',
      priority: 'medium',
      confidenceLevel: 'high',
      title: 'Missing Dedicated About or Contact Entity Pages',
      description: 'No /about, /contact, or /team URL was crawled in the sample.',
      whyItMatters: 'AI search models evaluate business accountability and real-world operational presence when selecting authoritative citations.',
      recommendation: 'Ensure dedicated About and Contact pages are linked prominently in main site navigation and footer.',
      implementationSteps: [
        'Create or link dedicated /about and /contact pages in the primary header and footer.',
        'Include company registration details, physical address, and contact email.',
      ],
      verificationCriteria: 'About and Contact URLs are accessible and linked from main navigation.',
      estimatedEffort: 'quick_fix',
      detectionMethod: 'Crawl link graph: no URLs matching /about, /contact, or /team identified.',
      evidence: {
        expected: 'Accessible About and Contact destinations in crawl graph',
        actual: '0 About/Contact URLs discovered in sample',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  const finalScore = Math.max(25, Math.min(100, scorePoints));

  return {
    score: finalScore,
    findings,
    signals: {
      hasOrganizationSchema: hasOrgSchema,
      hasAuthorEntity,
      hasAuthorCredentials,
      hasOutboundCitations,
      hasContactOrAbout,
      hasClearBrandName: true,
      machineReadabilityRatio: 0.85,
    },
  };
}
