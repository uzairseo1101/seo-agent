import { CrawledPageData, CrawlResult } from '../crawler/crawler';
import { AuditFinding, FindingSeverity } from '../types';

export function analyzeTechnicalSeo(
  crawlResult: CrawlResult,
  websiteId: string,
  auditRunId: string
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { pages, robotsTxt, sitemap } = crawlResult;

  // Track titles for duplicate detection
  const titleMap = new Map<string, string[]>();

  // Global Check 1: Robots.txt
  if (!robotsTxt.accessible) {
    findings.push({
      id: `fnd-rob-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages[0]?.url || 'root',
      category: 'technical',
      issueType: 'robots_txt_inaccessible',
      severity: 'high',
      title: 'Robots.txt Not Accessible or Missing',
      description: 'The web server returned an error (or 404) for /robots.txt, preventing predictable search engine crawl control.',
      recommendation: 'Create a valid robots.txt file at the domain root declaring crawl guidelines and linking to the sitemap.',
      confidenceLevel: 'high',
      detectionMethod: `HTTP GET to /robots.txt returned status ${robotsTxt.statusCode || 'inaccessible'}`,
      evidence: {
        expected: 'HTTP 200 with text/plain crawl directives',
        actual: `Status code ${robotsTxt.statusCode}`,
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Global Check 2: Sitemap
  if (!sitemap.accessible) {
    findings.push({
      id: `fnd-smp-${Date.now()}`,
      auditRunId,
      websiteId,
      url: pages[0]?.url || 'root',
      category: 'indexability',
      issueType: 'sitemap_inaccessible',
      severity: 'medium',
      title: 'XML Sitemap Inaccessible at Standard Locations',
      description: 'No accessible XML sitemap was discovered at /sitemap.xml or referenced inside robots.txt.',
      recommendation: 'Publish an XML sitemap and reference it with a "Sitemap: [URL]" directive inside robots.txt.',
      confidenceLevel: 'high',
      detectionMethod: 'HTTP GET request to standard sitemap endpoint failed or returned non-200.',
      evidence: {
        expected: 'Accessible XML sitemap index with valid <urlset>',
        actual: 'Sitemap endpoint unreachable or returned non-OK status',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // Per-Page Checks
  for (const page of pages) {
    const { url, title, metaDescription, canonicalUrl, h1Elements, h2Elements, metaRobots, xRobotsTag, images, hasMobileViewport, lang, statusCode, openGraph, schemas } = page;

    // Check: HTTP Status Code
    if (statusCode >= 400) {
      findings.push({
        id: `fnd-st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        issueType: 'http_error_status',
        severity: statusCode >= 500 ? 'critical' : 'high',
        title: `HTTP ${statusCode} Response Code Detected`,
        description: `Page returned an error status code ${statusCode}, preventing search engine indexing and frustrating users.`,
        recommendation: statusCode === 404 ? 'Verify URL routing or configure a 301 redirect to relevant active content.' : 'Investigate server error logs to resolve 5xx failures.',
        confidenceLevel: 'high',
        detectionMethod: `HTTP GET returned response status ${statusCode}`,
        evidence: {
          expected: 'HTTP 200 OK',
          actual: `HTTP ${statusCode}`,
          statusCode,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
      continue; // Skip deeper HTML checks on broken pages
    }

    // Check: Missing or Empty Title
    if (!title) {
      findings.push({
        id: `fnd-tit-0-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        issueType: 'missing_title',
        severity: 'critical',
        title: 'Missing Page Title Tag',
        description: 'The HTML document completely lacks a <title> element, severely degrading SERP snippet generation.',
        recommendation: 'Add a descriptive <title> tag between 30 and 60 characters containing primary keywords and brand identity.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM parser inspection: <title> tag absent from <head>',
        evidence: {
          expected: '1 descriptive <title> tag',
          actual: '0 <title> tags located in HTML <head>',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Title Length Heuristics
      if (title.length > 65) {
        findings.push({
          id: `fnd-tit-l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          auditRunId,
          websiteId,
          url,
          category: 'content',
          issueType: 'long_title',
          severity: 'low',
          title: 'Excessively Long Page Title (>65 Characters)',
          description: `The page title is ${title.length} characters long and is likely to be truncated on Google desktop and mobile SERPs.`,
          recommendation: 'Shorten the title tag to 50–60 characters to ensure full visibility in search snippets.',
          confidenceLevel: 'high',
          detectionMethod: `Character count evaluation: length = ${title.length} chars`,
          evidence: {
            expected: '30–65 characters',
            actual: `${title.length} characters: "${title}"`,
            snippet: `<title>${title}</title>`,
          },
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      } else if (title.length < 25) {
        findings.push({
          id: `fnd-tit-s-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          auditRunId,
          websiteId,
          url,
          category: 'content',
          issueType: 'short_title',
          severity: 'low',
          title: 'Short Page Title (<25 Characters)',
          description: `The title is only ${title.length} characters long, potentially missing relevant search intent queries.`,
          recommendation: 'Expand the title to include primary topic qualifiers and brand differentiation.',
          confidenceLevel: 'high',
          detectionMethod: `Character count evaluation: length = ${title.length} chars`,
          evidence: {
            expected: '30–60 characters with keyword context',
            actual: `${title.length} characters: "${title}"`,
            snippet: `<title>${title}</title>`,
          },
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Track for duplicate title
      const existing = titleMap.get(title) || [];
      existing.push(url);
      titleMap.set(title, existing);
    }

    // Check: Meta Description
    if (!metaDescription) {
      findings.push({
        id: `fnd-mde-0-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        issueType: 'missing_meta_description',
        severity: 'high',
        title: 'Missing Meta Description Tag',
        description: 'No <meta name="description"> tag was found. Search engines will generate automated snippet text from page body.',
        recommendation: 'Add a compelling meta description of 120–160 characters summarizing value proposition and encouraging clicks.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM inspection: meta[name="description"] absent',
        evidence: {
          expected: '1 meta description tag with 120–160 characters',
          actual: '0 meta description tags found',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else if (metaDescription.length < 50 || metaDescription.length > 165) {
      findings.push({
        id: `fnd-mde-l-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'content',
        issueType: metaDescription.length < 50 ? 'short_meta_description' : 'long_meta_description',
        severity: 'medium',
        title: metaDescription.length < 50 ? 'Suboptimal Short Meta Description (<50 chars)' : 'Excessively Long Meta Description (>165 chars)',
        description: `Meta description length is ${metaDescription.length} characters. May be truncated or lack search context.`,
        recommendation: 'Craft a focused description between 120 and 160 characters with clear call-to-action.',
        confidenceLevel: 'high',
        detectionMethod: `Metadata length check: ${metaDescription.length} characters`,
        evidence: {
          expected: '120–160 characters',
          actual: `${metaDescription.length} characters: "${metaDescription}"`,
          snippet: `<meta name="description" content="${metaDescription}" />`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Heading Structure (H1)
    if (h1Elements.length === 0) {
      findings.push({
        id: `fnd-h1-0-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        issueType: 'missing_h1',
        severity: 'critical',
        title: 'Missing Top-Level Heading (H1)',
        description: 'Page has no <h1> element, confusing heading document hierarchy for both search engines and assistive technology.',
        recommendation: 'Add a single descriptive <h1> heading communicating the core topic of the page.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM inspection: 0 <h1> elements detected',
        evidence: {
          expected: 'Exactly 1 descriptive <h1> tag',
          actual: '0 <h1> tags found in document',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else if (h1Elements.length > 1) {
      findings.push({
        id: `fnd-h1-m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'content',
        issueType: 'multiple_h1',
        severity: 'info',
        title: `Multiple H1 Headings Detected (${h1Elements.length})`,
        description: `Document contains ${h1Elements.length} separate <h1> tags. While HTML5 permits this, using a single primary H1 clarifies topic hierarchy.`,
        recommendation: 'Review headings to ensure only the primary page title uses <h1>, converting secondary section titles to <h2>.',
        confidenceLevel: 'high',
        detectionMethod: `DOM inspection: ${h1Elements.length} <h1> tags detected`,
        evidence: {
          expected: '1 primary <h1> per page',
          actual: `${h1Elements.length} tags: [${h1Elements.map(h => `"${h}"`).join(', ')}]`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Canonical Tag
    if (!canonicalUrl) {
      findings.push({
        id: `fnd-can-0-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        issueType: 'missing_canonical',
        severity: 'medium',
        title: 'Missing Canonical Tag',
        description: 'Page does not declare a rel="canonical" link, increasing risk of duplicate content if accessed via parameters or alternate protocols.',
        recommendation: 'Add a self-referential <link rel="canonical" href="..." /> tag.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM inspection: link[rel="canonical"] absent from <head>',
        evidence: {
          expected: `<link rel="canonical" href="${url}" />`,
          actual: 'No canonical tag present',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Meta Robots (Noindex)
    if (metaRobots && /noindex/i.test(metaRobots)) {
      findings.push({
        id: `fnd-noi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        issueType: 'noindex_directive_present',
        severity: 'high',
        title: 'Noindex Directive Present in Meta Robots',
        description: 'Page explicitly instructs search engines not to index this URL (<meta name="robots" content="noindex">).',
        recommendation: 'If this page is intended for public organic search visibility, remove the "noindex" directive.',
        confidenceLevel: 'high',
        detectionMethod: `DOM inspection: meta[name="robots"] content="${metaRobots}"`,
        evidence: {
          expected: 'index, follow (or absence of noindex)',
          actual: metaRobots,
          snippet: `<meta name="robots" content="${metaRobots}" />`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Mobile Viewport
    if (!hasMobileViewport) {
      findings.push({
        id: `fnd-mob-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        issueType: 'missing_mobile_viewport',
        severity: 'critical',
        title: 'Missing Mobile Viewport Meta Tag',
        description: 'Page lacks <meta name="viewport">, which may cause mobile browsers to render desktop scaling and fail mobile-friendliness.',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> inside <head>.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM inspection: meta[name="viewport"] absent',
        evidence: {
          expected: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          actual: 'Viewport tag missing',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Images Missing Alt Text
    const missingAltImages = images.filter(img => !img.alt || img.alt.trim() === '');
    if (missingAltImages.length > 0) {
      findings.push({
        id: `fnd-alt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'content',
        issueType: 'missing_image_alt',
        severity: 'low',
        title: `Images Missing Descriptive Alt Text (${missingAltImages.length})`,
        description: `${missingAltImages.length} image(s) on this page lack the alt attribute, impairing accessibility and image SEO.`,
        recommendation: 'Add concise, descriptive alt text to informative images (or empty alt="" for purely decorative graphics).',
        confidenceLevel: 'high',
        detectionMethod: `DOM inspection: ${missingAltImages.length} of ${images.length} <img> tags have missing or empty alt`,
        evidence: {
          expected: 'Descriptive alt text for all content images',
          actual: `${missingAltImages.length} image(s) missing alt attribute`,
          snippet: missingAltImages.slice(0, 2).map(img => `<img src="${img.src}" />`).join('\n'),
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Open Graph Tags
    if (!openGraph.title || !openGraph.description) {
      findings.push({
        id: `fnd-og-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url,
        category: 'content',
        issueType: 'missing_open_graph',
        severity: 'low',
        title: 'Incomplete Open Graph Metadata',
        description: 'Page lacks complete Open Graph social metadata (og:title and/or og:description), impairing rich sharing previews on LinkedIn, X, and messaging apps.',
        recommendation: 'Add <meta property="og:title"> and <meta property="og:description"> with custom preview image.',
        confidenceLevel: 'high',
        detectionMethod: 'DOM inspection: og:title or og:description missing',
        evidence: {
          expected: 'og:title, og:description, and og:image declared',
          actual: `og:title: ${openGraph.title ? 'present' : 'missing'}, og:description: ${openGraph.description ? 'present' : 'missing'}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Duplicate Titles Check (Cross-Page Sample)
  for (const [title, urls] of titleMap.entries()) {
    if (urls.length > 1) {
      findings.push({
        id: `fnd-dup-t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        auditRunId,
        websiteId,
        url: urls[0],
        category: 'content',
        issueType: 'duplicate_title_sample',
        severity: 'medium',
        title: `Duplicate Page Title Across Crawl Sample (${urls.length} URLs)`,
        description: `The exact title "${title}" is shared across ${urls.length} distinct URLs, creating potential keyword cannibalization.`,
        recommendation: 'Provide unique, differentiated title tags for each indexed URL reflecting specific page intent.',
        confidenceLevel: 'high',
        detectionMethod: `Crawl sample comparison: title "${title}" duplicated across ${urls.length} pages`,
        evidence: {
          expected: 'Unique title tag per indexed page',
          actual: `Duplicated on: ${urls.slice(0, 3).join(', ')}${urls.length > 3 ? '...' : ''}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return findings;
}
