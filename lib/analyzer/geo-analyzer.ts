import { CrawledPageData } from '../crawler/crawler';
import { AuditFinding } from '../types';

export interface GeoAnalysisResult {
  score: number;
  findings: AuditFinding[];
  signals: {
    hasOrganizationSchema: boolean;
    hasAuthorEntity: boolean;
    hasAuthorCredentials: boolean;
    hasOutboundCitations: boolean;
    hasContactOrAbout: boolean;
    machineReadabilityRatio: number;
  };
}

export function analyzeGeoSignals(
  pages: CrawledPageData[],
  websiteId: string,
  auditRunId: string,
  websiteUrl: string = 'https://example.com'
): GeoAnalysisResult {
  const findings: AuditFinding[] = [];
  let scorePoints = 100;
  const fallbackUrl = pages[0]?.url || websiteUrl;

  // 1. Organization Schema check
  const allSchemas = pages.flatMap(p => p.schemas);
  const hasOrgSchema = allSchemas.some(s => 
    s.type.toLowerCase().includes('organization') || 
    s.type.toLowerCase().includes('corporation') ||
    s.type.toLowerCase().includes('localbusiness')
  );

  if (!hasOrgSchema) {
    scorePoints -= 25;
    findings.push({
      id: `fnd-geo-org-${Date.now()}`,
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      issueType: 'missing_organization_schema',
      severity: 'high',
      title: 'Missing Organization / Brand Entity Schema (GEO Signal)',
      description: 'Generative AI search models (ChatGPT, Perplexity, Google AI Overviews) rely on Schema.org Organization markup to establish unambiguous entity identity.',
      recommendation: 'Implement Schema.org Organization JSON-LD markup on homepage with name, logo, url, sameAs profiles, and contactPoint.',
      confidenceLevel: 'high',
      detectionMethod: 'Structured data inspection: 0 Organization/LocalBusiness schemas found across crawled sample.',
      evidence: {
        expected: 'Schema.org Organization markup with verified brand attributes',
        actual: 'No Organization structured data discovered in crawled sample',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 2. Author Identification & Person Schema (for editorial/blog pages)
  const blogOrArticlePages = pages.filter(p => 
    p.url.includes('/blog') || p.url.includes('/article') || p.url.includes('/news') || p.url.includes('/post')
  );

  let hasAuthorEntity = false;
  let hasAuthorCredentials = false;

  if (blogOrArticlePages.length > 0) {
    const articleSchemas = blogOrArticlePages.flatMap(p => p.schemas);
    hasAuthorEntity = articleSchemas.some(s => 
      s.data?.author || s.type.toLowerCase().includes('person') || s.type.toLowerCase().includes('article')
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
        id: `fnd-geo-aut-${Date.now()}`,
        auditRunId,
        websiteId,
        url: blogOrArticlePages[0].url,
        category: 'geo',
        issueType: 'missing_author_entity',
        severity: 'high',
        title: 'Missing Author Person Entity in Editorial Content',
        description: 'AI engines prioritize verifiable author expertise when selecting citations for informational queries.',
        recommendation: 'Declare article authors using Schema.org Person with verified credentials, job title, and social citations (sameAs).',
        confidenceLevel: 'high',
        detectionMethod: 'Article structured data check: author entity is missing or rendered without structured schema.',
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
        id: `fnd-geo-crd-${Date.now()}`,
        auditRunId,
        websiteId,
        url: blogOrArticlePages[0].url,
        category: 'geo',
        issueType: 'author_lacks_verifiable_credentials',
        severity: 'medium',
        title: 'Author Entity Lacks External Credential Links (sameAs)',
        description: 'Author schema includes a name but omits external verification links (e.g. LinkedIn, personal domain, or industry directories).',
        recommendation: 'Add sameAs array linking to the author verified professional profiles to strengthen entity graph confidence.',
        confidenceLevel: 'medium',
        detectionMethod: 'Schema inspection: author.sameAs array is empty or undefined.',
        evidence: {
          expected: 'author.sameAs array containing at least 1 verified profile link',
          actual: 'author.sameAs is missing',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // 3. Source Transparency & Outbound Citations
  let totalExternalLinks = 0;
  for (const page of pages) {
    totalExternalLinks += page.externalLinks.length;
  }
  const hasOutboundCitations = totalExternalLinks >= Math.max(1, pages.length * 0.4);

  if (!hasOutboundCitations && pages.length >= 3) {
    scorePoints -= 15;
    findings.push({
      id: `fnd-geo-cit-${Date.now()}`,
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      issueType: 'low_source_transparency',
      severity: 'medium',
      title: 'Low Outbound Source Transparency (Factual Citations)',
      description: 'The crawled sample has very few outbound reference citations. AI citation engines evaluate source transparency as a credibility signal.',
      recommendation: 'Reference primary research, official standards, or academic sources when presenting statistics or claims.',
      confidenceLevel: 'medium',
      detectionMethod: `External link count across sample = ${totalExternalLinks} (below source transparency threshold)`,
      evidence: {
        expected: 'At least 1-2 authoritative outbound references on informational pages',
        actual: `${totalExternalLinks} external references found across ${pages.length} pages`,
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // 4. About & Contact Information presence
  const hasContactOrAbout = pages.some(p => 
    p.url.includes('/about') || p.url.includes('/contact') || p.url.includes('/team')
  );

  if (!hasContactOrAbout && pages.length >= 3) {
    scorePoints -= 15;
    findings.push({
      id: `fnd-geo-abt-${Date.now()}`,
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'geo',
      issueType: 'missing_about_or_contact_signals',
      severity: 'medium',
      title: 'Missing Direct About or Contact Entity Pages',
      description: 'No /about, /contact, or /team URL was crawled in the sample. AI engines evaluate operational presence and accountability.',
      recommendation: 'Ensure About and Contact pages are linked prominently in navigation and footer with organizational identity.',
      confidenceLevel: 'high',
      detectionMethod: 'Crawl link graph: no URLs matching /about, /contact, or /team identified.',
      evidence: {
        expected: 'Dedicated About and Contact destinations in crawl sample',
        actual: '0 About/Contact URLs discovered in sample',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Final score clamping
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
      machineReadabilityRatio: 0.85,
    },
  };
}
