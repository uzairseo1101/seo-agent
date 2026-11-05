import { CrawledPageData, CrawlResult } from '../crawler/crawler';
import { AuditFinding, FindingCategory, FindingSeverity, FindingType, TaskPriority, EstimatedEffort } from '../types';
import { generateUuid } from '../utils';

/**
 * Deterministic Technical SEO & On-Page Audit Engine
 * Analyzes crawl data with exact evidence and reproducible rules.
 */
export function analyzeTechnicalSeo(
  crawlResult: CrawlResult,
  websiteId: string,
  auditRunId: string,
  websiteUrl: string = 'https://example.com'
): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const { pages, robotsTxt, sitemap, discoveredUrls, skippedUrls } = crawlResult;
  const fallbackUrl = pages[0]?.url || websiteUrl;

  // Build maps for cross-page structural analysis
  const titleMap = new Map<string, string[]>();
  const descriptionMap = new Map<string, string[]>();
  const pageInlinksMap = new Map<string, Set<string>>(); // targetUrl -> Set of sourceUrls
  const crawledUrlsSet = new Set<string>(pages.map(p => p.url));
  const brokenPagesMap = new Map<string, number>(); // url -> statusCode

  for (const page of pages) {
    if (page.statusCode >= 400) {
      brokenPagesMap.set(page.url, page.statusCode);
      brokenPagesMap.set(page.finalUrl, page.statusCode);
    }
    for (const link of page.internalLinks) {
      if (!pageInlinksMap.has(link)) {
        pageInlinksMap.set(link, new Set<string>());
      }
      pageInlinksMap.get(link)!.add(page.url);
    }
  }

  // =========================================================================
  // GLOBAL CHECK 1: Robots.txt Accessibility & Directives
  // =========================================================================
  if (!robotsTxt.accessible) {
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'technical',
      findingType: 'confirmed_error',
      issueType: 'robots_txt_inaccessible',
      severity: 'high',
      priority: 'high',
      confidenceLevel: 'high',
      title: 'Robots.txt Inaccessible or Missing',
      description: 'The web server returned an error (or 404) for /robots.txt, preventing predictable search engine crawl control.',
      whyItMatters: 'Without an accessible robots.txt, crawlers cannot discover sitemaps or crawl delays, leading to inefficient crawl budget usage.',
      recommendation: 'Create a valid robots.txt file at domain root declaring crawl directives and referencing the primary XML sitemap.',
      implementationSteps: [
        'Create a plain text file named robots.txt at your web server public root.',
        'Declare user-agent directives: User-agent: * followed by Disallow paths if needed.',
        'Add your sitemap URL: Sitemap: https://yourdomain.com/sitemap.xml',
        'Verify via Google Search Console robots testing tool.',
      ],
      verificationCriteria: 'HTTP GET to /robots.txt returns status 200 with text/plain content type.',
      estimatedEffort: 'quick_fix',
      detectionMethod: `HTTP GET to /robots.txt returned status ${robotsTxt.statusCode || 'inaccessible'}`,
      evidence: {
        expected: 'HTTP 200 with text/plain crawl directives',
        actual: `Status code ${robotsTxt.statusCode}`,
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // =========================================================================
  // GLOBAL CHECK 2: XML Sitemap Accessibility & Indexability
  // =========================================================================
  if (!sitemap.accessible) {
    findings.push({
      id: generateUuid(),
      auditRunId,
      websiteId,
      url: fallbackUrl,
      category: 'indexability',
      findingType: 'warning',
      issueType: 'sitemap_inaccessible',
      severity: 'medium',
      priority: 'medium',
      confidenceLevel: 'high',
      title: 'XML Sitemap Inaccessible at Standard Locations',
      description: 'No accessible XML sitemap was discovered at /sitemap.xml or referenced inside robots.txt.',
      whyItMatters: 'XML sitemaps ensure all deep or newly created pages are discovered efficiently by search engine crawlers.',
      recommendation: 'Publish a valid XML sitemap and reference it with a "Sitemap: [URL]" directive inside robots.txt.',
      implementationSteps: [
        'Generate an XML sitemap complying with the sitemaps.org protocol.',
        'Host the file at /sitemap.xml on your production domain.',
        'Add Sitemap: https://yourdomain.com/sitemap.xml to robots.txt.',
        'Submit the sitemap directly inside Google Search Console.',
      ],
      verificationCriteria: 'HTTP GET to /sitemap.xml returns HTTP 200 with valid XML <urlset> or <sitemapindex>.',
      estimatedEffort: 'moderate',
      detectionMethod: 'HTTP GET request to standard sitemap endpoint failed or returned non-200.',
      evidence: {
        expected: 'Accessible XML sitemap index with valid <urlset>',
        actual: 'Sitemap endpoint unreachable or returned non-OK status',
      },
      isResolved: false,
      createdAt: new Date().toISOString(),
    });
  }

  // =========================================================================
  // PER-PAGE EVALUATIONS
  // =========================================================================
  for (const page of pages) {
    const {
      url,
      finalUrl,
      statusCode,
      loadTimeMs,
      contentType,
      title,
      metaDescription,
      canonicalUrl,
      metaRobots,
      xRobotsTag,
      h1Elements,
      h2Elements,
      h3Elements,
      images,
      hasMobileViewport,
      lang,
      openGraph,
      twitterCard,
      schemas,
      wordCount,
      isRedirectChain,
      isRedirectLoop,
      redirectHops,
      isClientSideRendered,
      contentEncoding,
      cacheControl,
    } = page;

    // Check: Insecure HTTP Protocol
    if (url.startsWith('http://')) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'insecure_http_protocol',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Insecure HTTP Protocol in Crawl Target',
        description: 'Page was accessed over insecure HTTP without automatic HTTPS encryption.',
        whyItMatters: 'Google considers HTTPS a security baseline and page experience signal. Browsers flag unencrypted pages as insecure.',
        recommendation: 'Configure an SSL/TLS certificate and enforce automatic 301 redirects from HTTP to HTTPS across all URLs.',
        implementationSteps: [
          'Install or renew SSL certificate through your host or CDN (e.g. Cloudflare, Let\'s Encrypt).',
          'Configure web server (Nginx/Apache/Cloudflare) with 301 Permanent Redirect to https://.',
          'Update internal links and canonical tags to use https://.',
        ],
        verificationCriteria: 'HTTP request to the URL automatically redirects to HTTPS with valid SSL certificate.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'Protocol evaluation: URL scheme is http:// instead of https://',
        evidence: {
          expected: 'https:// protocol',
          actual: url,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Redirect Loops
    if (isRedirectLoop) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'redirect_loop',
        severity: 'critical',
        priority: 'critical',
        confidenceLevel: 'high',
        title: 'Redirect Loop Detected',
        description: `URL triggered an infinite redirect loop across hops: ${redirectHops.join(' -> ')}`,
        whyItMatters: 'Redirect loops completely prevent both search crawlers and users from accessing content, resulting in 100% loss of ranking.',
        recommendation: 'Audit server redirect rules and eliminate circular redirect references.',
        implementationSteps: [
          'Inspect server redirect configuration (e.g., .htaccess, next.config, or middleware).',
          'Identify circular routing where URL A points to URL B which points back to URL A.',
          'Point all obsolete destinations directly to the final canonical destination in one hop.',
        ],
        verificationCriteria: 'Crawling the URL returns HTTP 200 or a single 301 hop without cycles.',
        estimatedEffort: 'quick_fix',
        detectionMethod: `Manual hop tracer: circular destination detected in hops: ${redirectHops.join(' -> ')}`,
        evidence: {
          expected: 'Single hop or direct HTTP 200',
          actual: `Redirect loop: ${[url, ...redirectHops].join(' -> ')}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
      continue; // Skip further HTML evaluations on broken loops
    }

    // Check: Redirect Chains (> 1 hop)
    if (isRedirectChain) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'warning',
        issueType: 'redirect_chain',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'high',
        title: `Redirect Chain Detected (${redirectHops.length} Hops)`,
        description: `URL passes through multiple redirect steps before reaching destination: ${[url, ...redirectHops].join(' -> ')}`,
        whyItMatters: 'Redirect chains dilute PageRank equity, slow down page load times, and waste search engine crawl budget.',
        recommendation: 'Update server redirect rules and internal links to point directly to the final destination URL.',
        implementationSteps: [
          'Update source redirect rule to target the final destination in a single 301 hop.',
          'Update internal links targeting this URL to use the final destination directly.',
        ],
        verificationCriteria: 'URL resolves in a single HTTP 301 hop directly to destination.',
        estimatedEffort: 'quick_fix',
        detectionMethod: `Hop tracer recorded ${redirectHops.length} intermediate hops`,
        evidence: {
          expected: 'Maximum 1 redirect hop',
          actual: `${redirectHops.length} hops: ${[url, ...redirectHops].join(' -> ')}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: HTTP Error Status (4xx, 5xx)
    if (statusCode >= 400) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: statusCode >= 500 ? 'http_5xx_server_error' : 'http_4xx_client_error',
        severity: statusCode >= 500 ? 'critical' : 'high',
        priority: statusCode >= 500 ? 'critical' : 'high',
        confidenceLevel: 'high',
        title: `HTTP ${statusCode} Response Code Detected`,
        description: `Page returned an error status code ${statusCode}, preventing search engine indexing and frustrating users.`,
        whyItMatters: 'Broken pages cannot rank and cause poor user experience. 5xx errors indicate server instability.',
        recommendation: statusCode === 404
          ? 'Verify whether the page was removed. If intentional, implement a 301 redirect to relevant equivalent content or update linking references.'
          : 'Check web server and backend application logs to resolve the 5xx error.',
        implementationSteps: [
          'Review server access and error logs for the requested endpoint.',
          'If URL is obsolete, set up a 301 redirect to the nearest equivalent content.',
          'If page should exist, fix routing, database connections, or application logic.',
        ],
        verificationCriteria: `Re-crawling ${url} returns HTTP 200 OK.`,
        estimatedEffort: statusCode === 404 ? 'quick_fix' : 'moderate',
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

    // Check: Soft 404 Indicators (200 OK but page states "Not Found" or virtually empty)
    const lowerTitle = (title || '').toLowerCase();
    const isSoft404 = (
      statusCode === 200 &&
      (lowerTitle.includes('404') || lowerTitle.includes('not found') || lowerTitle.includes('page not found')) &&
      wordCount < 100
    );

    if (isSoft404) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        findingType: 'confirmed_error',
        issueType: 'soft_404_detected',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Soft 404 Error Detected (HTTP 200 with "Not Found" Content)',
        description: 'Page returns HTTP 200 OK status, but page title and content indicate a "Page Not Found" message.',
        whyItMatters: 'Google flags soft 404 pages because they confuse search engines into indexing non-existent content.',
        recommendation: 'Configure your web server or router to return a true HTTP 404 Not Found or 410 Gone status code for missing content.',
        implementationSteps: [
          'Check application route handlers and catch-all routes.',
          'Ensure missing content renders with an explicit res.status(404) or Next.js notFound().',
        ],
        verificationCriteria: `Requesting ${url} returns HTTP 404 instead of HTTP 200.`,
        estimatedEffort: 'quick_fix',
        detectionMethod: `DOM & Status evaluation: HTTP 200 OK accompanied by "${title}" and word count ${wordCount}`,
        evidence: {
          expected: 'HTTP 404 for missing content, or active page content for HTTP 200',
          actual: `HTTP 200 with title: "${title}" and word count: ${wordCount}`,
          snippet: `<title>${title}</title>`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Missing or Empty Title Tag
    if (!title || title.trim() === '') {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'missing_title',
        severity: 'critical',
        priority: 'critical',
        confidenceLevel: 'high',
        title: 'Missing or Empty Page Title Tag',
        description: 'The HTML document lacks a descriptive <title> element inside <head>.',
        whyItMatters: 'Title tags are one of the most critical on-page ranking signals and directly determine search snippet headlines.',
        recommendation: 'Add a descriptive <title> tag between 30 and 60 characters containing primary keywords and brand identity.',
        implementationSteps: [
          'Add a <title> element inside the HTML <head>.',
          'Include primary target keyword near the beginning, followed by brand name.',
          'Keep length between 30 and 60 characters.',
        ],
        verificationCriteria: 'HTML <head> contains non-empty <title> tag with 30–60 characters.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM parser inspection: <title> tag absent or empty in HTML <head>',
        evidence: {
          expected: '1 descriptive <title> tag (30–60 characters)',
          actual: title ? 'Empty <title></title>' : 'No <title> tag present',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Title Length Guidelines (Configurable recommendation, not presented as guaranteed ranking factor)
      if (title.length > 65) {
        findings.push({
          id: generateUuid(),
          auditRunId,
          websiteId,
          url,
          category: 'content',
          findingType: 'opportunity',
          issueType: 'long_title',
          severity: 'low',
          priority: 'low',
          confidenceLevel: 'high',
          title: 'Long Page Title (>65 Characters) — Snippet Truncation Risk',
          description: `The page title is ${title.length} characters long and may be truncated on Google desktop and mobile SERPs.`,
          whyItMatters: 'Truncated titles may cut off important brand value propositions in search results, reducing click-through rate.',
          recommendation: 'Refine the title tag to 50–60 characters to ensure full visibility across all device viewports.',
          implementationSteps: [
            'Shorten secondary descriptions or eliminate redundant keywords.',
            'Place the most impactful keywords and brand differentiator within the first 55 characters.',
          ],
          verificationCriteria: 'Title tag length is 60 characters or fewer.',
          estimatedEffort: 'quick_fix',
          detectionMethod: `Character count evaluation: length = ${title.length} chars`,
          evidence: {
            expected: '30–60 characters recommended for snippet display',
            actual: `${title.length} characters: "${title}"`,
            snippet: `<title>${title}</title>`,
          },
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      } else if (title.length < 25) {
        findings.push({
          id: generateUuid(),
          auditRunId,
          websiteId,
          url,
          category: 'content',
          findingType: 'opportunity',
          issueType: 'short_title',
          severity: 'low',
          priority: 'low',
          confidenceLevel: 'high',
          title: 'Short Page Title (<25 Characters)',
          description: `The title is only ${title.length} characters long, potentially missing relevant search intent qualifiers.`,
          whyItMatters: 'Very short titles underutilize SERP real estate and fail to capture conversational and long-tail search intent.',
          recommendation: 'Expand the title to include primary topic qualifiers and brand differentiation.',
          implementationSteps: [
            'Add core service or product qualifier: e.g. "Keyword — Benefit | Brand".',
            'Ensure expanded title remains natural and informative.',
          ],
          verificationCriteria: 'Title tag length is at least 30 characters.',
          estimatedEffort: 'quick_fix',
          detectionMethod: `Character count evaluation: length = ${title.length} chars`,
          evidence: {
            expected: '30–60 characters recommended',
            actual: `${title.length} characters: "${title}"`,
            snippet: `<title>${title}</title>`,
          },
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Track duplicate titles
      const existing = titleMap.get(title) || [];
      existing.push(url);
      titleMap.set(title, existing);
    }

    // Check: Missing Meta Description
    if (!metaDescription || metaDescription.trim() === '') {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'warning',
        issueType: 'missing_meta_description',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Missing Meta Description Tag',
        description: 'No <meta name="description"> tag was found in the HTML document.',
        whyItMatters: 'Search engines will auto-generate snippet text from random page copy if no meta description is provided.',
        recommendation: 'Add a compelling meta description of 120–160 characters summarizing the page value proposition.',
        implementationSteps: [
          'Add <meta name="description" content="..."> inside HTML <head>.',
          'Include a clear call to action and primary topic phrase.',
          'Keep length between 120 and 160 characters.',
        ],
        verificationCriteria: 'HTML contains non-empty meta[name="description"] between 100 and 160 characters.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: meta[name="description"] absent from document',
        evidence: {
          expected: '1 meta description tag with 120–160 characters',
          actual: '0 meta description tags found',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      if (metaDescription.length < 50 || metaDescription.length > 165) {
        findings.push({
          id: generateUuid(),
          auditRunId,
          websiteId,
          url,
          category: 'content',
          findingType: 'opportunity',
          issueType: metaDescription.length < 50 ? 'short_meta_description' : 'long_meta_description',
          severity: 'low',
          priority: 'low',
          confidenceLevel: 'high',
          title: metaDescription.length < 50 ? 'Short Meta Description (<50 chars)' : 'Long Meta Description (>165 chars)',
          description: `Meta description length is ${metaDescription.length} characters. May be truncated on mobile SERPs or lack context.`,
          whyItMatters: 'Optimized meta description length maximizes CTR in search results without truncation.',
          recommendation: 'Craft a focused description between 120 and 160 characters with a clear call-to-action.',
          implementationSteps: [
            'Adjust description text length to between 120 and 160 characters.',
            'Ensure the value proposition and core offering are clearly stated.',
          ],
          verificationCriteria: 'Meta description length is between 100 and 160 characters.',
          estimatedEffort: 'quick_fix',
          detectionMethod: `Metadata length check: ${metaDescription.length} characters`,
          evidence: {
            expected: '120–160 characters recommended',
            actual: `${metaDescription.length} characters: "${metaDescription}"`,
            snippet: `<meta name="description" content="${metaDescription}" />`,
          },
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }

      // Track duplicate meta descriptions
      const existingDesc = descriptionMap.get(metaDescription) || [];
      existingDesc.push(url);
      descriptionMap.set(metaDescription, existingDesc);
    }

    // Check: Heading Hierarchy (H1)
    if (h1Elements.length === 0) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'missing_h1',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Missing Top-Level Heading (H1)',
        description: 'Page has no <h1> element, confusing heading document hierarchy for search engines and screen readers.',
        whyItMatters: 'H1 tags define the primary subject of a page and structure content accessibility.',
        recommendation: 'Add a single descriptive <h1> heading communicating the core topic of the page.',
        implementationSteps: [
          'Add an <h1> heading to the top of the main content area.',
          'Ensure the H1 clearly describes page intent.',
        ],
        verificationCriteria: 'Page contains exactly one <h1> heading.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: 0 <h1> elements detected',
        evidence: {
          expected: 'Exactly 1 descriptive <h1> tag',
          actual: '0 <h1> tags found in document',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else if (h1Elements.length > 1) {
      // Multiple H1s is a review signal / notice, NOT automatically a critical error
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'content',
        findingType: 'informational',
        issueType: 'multiple_h1_review_signal',
        severity: 'notice',
        priority: 'low',
        confidenceLevel: 'high',
        title: `Multiple H1 Headings Detected (${h1Elements.length}) — Review Signal`,
        description: `Document contains ${h1Elements.length} separate <h1> tags. While HTML5 allows this, SEO best practice recommends a single primary H1 for clarity.`,
        whyItMatters: 'Having one clear H1 reinforces the main topical entity for search engines and voice search assistants.',
        recommendation: 'Review headings: keep the primary topic as <h1> and convert subheadings into <h2> elements.',
        implementationSteps: [
          'Choose the single most prominent headline for <h1>.',
          'Change secondary <h1> tags to <h2> tags.',
        ],
        verificationCriteria: 'Document uses a single primary <h1> heading.',
        estimatedEffort: 'quick_fix',
        detectionMethod: `DOM inspection: ${h1Elements.length} <h1> tags detected`,
        evidence: {
          expected: '1 primary <h1> heading recommended for SEO clarity',
          actual: `${h1Elements.length} tags: [${h1Elements.slice(0, 3).map(h => `"${h}"`).join(', ')}]`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Heading Hierarchy Skips (e.g. H1 -> H3 without H2)
    if (h3Elements.length > 0 && h2Elements.length === 0 && h1Elements.length > 0) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'content',
        findingType: 'warning',
        issueType: 'heading_hierarchy_skipped',
        severity: 'low',
        priority: 'low',
        confidenceLevel: 'high',
        title: 'Heading Hierarchy Skips Level (H1 directly to H3 without H2)',
        description: 'Page jumps from <h1> directly to <h3> headings without any <h2> elements, breaking semantic document hierarchy.',
        whyItMatters: 'Screen readers and search engine document parsers expect headings in sequential nested order.',
        recommendation: 'Nest headings sequentially: use <h2> for major sections and <h3> for subsections.',
        implementationSteps: [
          'Promote <h3> section headings to <h2>, or introduce an intermediate <h2> heading.',
        ],
        verificationCriteria: 'Headings follow sequential order (H1 -> H2 -> H3).',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'Heading hierarchy inspection: H3 present with 0 H2 elements',
        evidence: {
          expected: 'H1 followed by H2 subsections before H3',
          actual: `H1 count: ${h1Elements.length}, H2 count: 0, H3 count: ${h3Elements.length}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Canonical Tag Consistency
    if (!canonicalUrl) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        findingType: 'warning',
        issueType: 'missing_canonical',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'high',
        title: 'Missing Canonical Tag',
        description: 'Page does not declare a rel="canonical" link, increasing risk of duplicate content if accessed via alternate URLs.',
        whyItMatters: 'Canonical tags instruct Google which URL represents the master version, consolidating link equity.',
        recommendation: `Add a self-referential <link rel="canonical" href="${url}" /> tag.`,
        implementationSteps: [
          'Add <link rel="canonical" href="https://yourdomain.com/exact-path" /> in HTML <head>.',
          'Ensure the URL is absolute and uses HTTPS.',
        ],
        verificationCriteria: 'HTML <head> contains absolute rel="canonical" link matching the preferred URL.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: link[rel="canonical"] absent from <head>',
        evidence: {
          expected: `<link rel="canonical" href="${url}" />`,
          actual: 'No canonical tag found',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Canonical points to different URL
      try {
        const parsedCanonical = new URL(canonicalUrl);
        const parsedCurrent = new URL(finalUrl || url);
        if (parsedCanonical.href !== parsedCurrent.href) {
          findings.push({
            id: generateUuid(),
            auditRunId,
            websiteId,
            url,
            category: 'indexability',
            findingType: 'informational',
            issueType: 'canonical_points_to_different_url',
            severity: 'notice',
            priority: 'low',
            confidenceLevel: 'high',
            title: 'Canonical Tag Points to Different URL',
            description: `This page specifies a different canonical URL: ${canonicalUrl}. Search engines will credit ranking equity to the target URL.`,
            whyItMatters: 'If this is intentional (e.g. syndicated content or tracking parameters), no change is needed. If accidental, this page will not be indexed.',
            recommendation: 'Verify that this page is intended to consolidate equity into the target canonical URL.',
            implementationSteps: [
              'Verify whether this URL should index independently.',
              'If it should index, update canonical to point to itself.',
              'If it is a parameter variation, retain the existing canonical target.',
            ],
            verificationCriteria: 'Canonical URL accurately reflects intended indexing strategy.',
            estimatedEffort: 'quick_fix',
            detectionMethod: `Canonical comparison: current (${url}) vs canonical (${canonicalUrl})`,
            evidence: {
              expected: 'Intentional canonical consolidation',
              actual: `Current: ${url} -> Canonical: ${canonicalUrl}`,
            },
            isResolved: false,
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        // Invalid canonical URL format
      }
    }

    // Check: Meta Robots Noindex
    if (metaRobots && /noindex/i.test(metaRobots)) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        findingType: 'confirmed_error',
        issueType: 'meta_robots_noindex_present',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Noindex Directive in Meta Robots Tag',
        description: 'Page explicitly instructs search engines not to index this URL (<meta name="robots" content="noindex">).',
        whyItMatters: 'The page will be removed from Google search index and cannot generate organic traffic.',
        recommendation: 'If this page is intended for public organic search visibility, remove the "noindex" directive.',
        implementationSteps: [
          'Inspect template or CMS settings for this page.',
          'Remove "noindex" from the meta robots declaration.',
          'Request re-indexing via Google Search Console URL inspection.',
        ],
        verificationCriteria: 'Meta robots does not contain "noindex".',
        estimatedEffort: 'quick_fix',
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

    // Check: X-Robots-Tag Header Noindex
    if (xRobotsTag && /noindex/i.test(xRobotsTag)) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'indexability',
        findingType: 'confirmed_error',
        issueType: 'x_robots_tag_noindex_present',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Noindex Directive in X-Robots-Tag HTTP Header',
        description: `Server returned HTTP header "X-Robots-Tag: ${xRobotsTag}", instructing crawlers not to index this page.`,
        whyItMatters: 'HTTP header directives override HTML meta tags and prevent search engine indexing.',
        recommendation: 'Update web server or edge middleware configuration to remove the noindex header.',
        implementationSteps: [
          'Inspect server response headers configuration in Nginx, Apache, or CDN rules.',
          'Remove X-Robots-Tag: noindex header from public indexable routes.',
        ],
        verificationCriteria: 'HTTP response headers do not include X-Robots-Tag: noindex.',
        estimatedEffort: 'quick_fix',
        detectionMethod: `Header inspection: X-Robots-Tag = "${xRobotsTag}"`,
        evidence: {
          expected: 'Absence of noindex in HTTP response headers',
          actual: `X-Robots-Tag: ${xRobotsTag}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Mobile Viewport
    if (!hasMobileViewport) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'missing_mobile_viewport',
        severity: 'critical',
        priority: 'critical',
        confidenceLevel: 'high',
        title: 'Missing Mobile Viewport Meta Tag',
        description: 'Page lacks <meta name="viewport">, causing mobile browsers to render desktop scaling and fail mobile usability.',
        whyItMatters: 'Google evaluates mobile-first indexing for 100% of websites. Missing viewport results in severe mobile penalties.',
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> inside <head>.',
        implementationSteps: [
          'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> inside HTML <head>.',
        ],
        verificationCriteria: 'HTML contains valid mobile viewport meta tag.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: meta[name="viewport"] absent',
        evidence: {
          expected: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          actual: 'Viewport tag missing from HTML <head>',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Missing Image Alt Attributes
    const missingAltImages = images.filter(img => img.isMissingAlt);
    if (missingAltImages.length > 0) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'content',
        findingType: 'warning',
        issueType: 'missing_image_alt',
        severity: 'low',
        priority: 'low',
        confidenceLevel: 'high',
        title: `Images Missing Alt Text (${missingAltImages.length})`,
        description: `${missingAltImages.length} image(s) lack an alt attribute, hindering screen reader accessibility and image search indexation.`,
        whyItMatters: 'Image alt text helps search engines understand image context and provides critical accessibility for visually impaired users.',
        recommendation: 'Add descriptive alt text to informative images (or empty alt="" for purely decorative graphics).',
        implementationSteps: [
          'Audit images and add concise, descriptive alt attributes.',
          'Avoid keyword stuffing; describe the visual element accurately.',
        ],
        verificationCriteria: 'All content images have descriptive alt attributes.',
        estimatedEffort: 'moderate',
        detectionMethod: `DOM inspection: ${missingAltImages.length} of ${images.length} <img> tags missing alt`,
        evidence: {
          expected: 'Descriptive alt text for all content images',
          actual: `${missingAltImages.length} image(s) missing alt attribute`,
          snippet: missingAltImages.slice(0, 2).map(img => `<img src="${img.src}" />`).join('\n'),
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Missing Language Declaration
    if (!lang || lang.trim() === '') {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'warning',
        issueType: 'missing_html_lang',
        severity: 'low',
        priority: 'low',
        confidenceLevel: 'high',
        title: 'Missing HTML Language Declaration (lang attribute)',
        description: 'The root <html> element does not specify a lang attribute (e.g. lang="en").',
        whyItMatters: 'Declaring language assists search engines with geo-targeting and enables speech synthesizers to pronounce text correctly.',
        recommendation: 'Add lang="en" (or appropriate ISO 639-1 code) to the opening <html> element.',
        implementationSteps: [
          'Locate opening <html> tag in root template.',
          'Add lang="en" (or your target language code).',
        ],
        verificationCriteria: '<html lang="..."> has a valid language declaration.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: <html lang> attribute missing or empty',
        evidence: {
          expected: '<html lang="en"> (or target ISO 639-1 language)',
          actual: '<html> tag lacks lang attribute',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Open Graph Metadata
    if (!openGraph.title || !openGraph.description) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'content',
        findingType: 'opportunity',
        issueType: 'missing_open_graph',
        severity: 'low',
        priority: 'low',
        confidenceLevel: 'high',
        title: 'Incomplete Open Graph Social Metadata',
        description: 'Page lacks complete Open Graph metadata (og:title and/or og:description) for rich social sharing cards.',
        whyItMatters: 'When shared across social networks and chat platforms, incomplete OG metadata results in generic or blank previews.',
        recommendation: 'Add <meta property="og:title"> and <meta property="og:description"> along with a high-resolution preview image.',
        implementationSteps: [
          'Add og:title, og:description, and og:image tags in HTML <head>.',
        ],
        verificationCriteria: 'HTML contains valid og:title, og:description, and og:image tags.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'DOM inspection: og:title or og:description missing',
        evidence: {
          expected: 'og:title, og:description, and og:image declared',
          actual: `og:title: ${openGraph.title ? 'present' : 'missing'}, og:description: ${openGraph.description ? 'present' : 'missing'}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Client-Side Rendering Risk
    if (isClientSideRendered) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'warning',
        issueType: 'client_side_rendering_risk',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'medium',
        title: 'Client-Side Rendering Risk (Empty Initial HTML Payload)',
        description: 'Initial raw HTML payload contains fewer than 60 words inside container tags (#root / #__next / #app), indicating client-rendered architecture.',
        whyItMatters: 'Search engine crawlers may delay rendering or fail to index JavaScript-only content if rendering queues are backlogged.',
        recommendation: 'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for important indexable content.',
        implementationSteps: [
          'Evaluate SSR or SSG in your framework (Next.js getServerSideProps/Server Components, Nuxt, Astro).',
          'Ensure primary textual content is present in the initial HTML response before client JS executes.',
        ],
        verificationCriteria: 'Initial HTML response contains full rendered article/page copy without requiring JS execution.',
        estimatedEffort: 'complex',
        detectionMethod: `HTML payload inspection: <div id="root|__next"> detected with wordCount = ${wordCount}`,
        evidence: {
          expected: 'Substantive textual content in initial HTML response',
          actual: `Initial HTML contains only ${wordCount} words before client script hydration`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check: Structured Data Syntax Errors
    const invalidSchemas = schemas.filter(s => !s.isValidJson);
    if (invalidSchemas.length > 0) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'invalid_json_ld_syntax',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: 'Invalid JSON-LD Syntax in Structured Data',
        description: `${invalidSchemas.length} JSON-LD <script> block(s) contain syntax errors that prevent search engines from parsing schema.`,
        whyItMatters: 'Search engines ignore malformed JSON-LD schemas entirely, disqualifying the page from rich search snippets.',
        recommendation: 'Fix JSON syntax: resolve unescaped characters, trailing commas, or missing quotation marks.',
        implementationSteps: [
          'Locate script[type="application/ld+json"] on this page.',
          'Validate markup using Google Rich Results Test or schema validator.',
          'Ensure string values are properly escaped.',
        ],
        verificationCriteria: 'All JSON-LD blocks parse cleanly with JSON.parse without syntax exceptions.',
        estimatedEffort: 'quick_fix',
        detectionMethod: `JSON.parse threw exception: ${invalidSchemas[0]?.syntaxError || 'Syntax error'}`,
        evidence: {
          expected: 'Valid JSON-LD schema complying with JSON standards',
          actual: `Syntax error: ${invalidSchemas[0]?.syntaxError}`,
          snippet: invalidSchemas[0]?.rawJson,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // =========================================================================
  // CROSS-PAGE CHECKS (DUPLICATE CONTENT & SITE ARCHITECTURE)
  // =========================================================================

  // Duplicate Titles Check across Crawled Sample
  for (const [title, urls] of titleMap.entries()) {
    if (urls.length > 1) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: urls[0],
        category: 'content',
        findingType: 'warning',
        issueType: 'duplicate_title_sample',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'high',
        title: `Duplicate Page Title Across Crawl Sample (${urls.length} URLs)`,
        description: `The exact title "${title}" is shared across ${urls.length} distinct URLs, creating potential keyword cannibalization.`,
        whyItMatters: 'Duplicate titles cause search engines to compete the wrong pages against each other in SERPs.',
        recommendation: 'Provide unique, differentiated title tags for each indexed URL reflecting specific page intent.',
        implementationSteps: [
          'Review the affected URLs and assign unique descriptive titles to each.',
        ],
        verificationCriteria: 'Each indexed URL has a distinct, non-identical title tag.',
        estimatedEffort: 'moderate',
        detectionMethod: `Cross-page analysis: title "${title}" duplicated on ${urls.length} pages`,
        evidence: {
          expected: 'Unique title tag per indexed page',
          actual: `Duplicated on: ${urls.slice(0, 3).join(', ')}${urls.length > 3 ? '...' : ''}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Duplicate Meta Descriptions Check
  for (const [desc, urls] of descriptionMap.entries()) {
    if (urls.length > 1) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: urls[0],
        category: 'content',
        findingType: 'opportunity',
        issueType: 'duplicate_meta_description_sample',
        severity: 'low',
        priority: 'low',
        confidenceLevel: 'high',
        title: `Duplicate Meta Description Across ${urls.length} Pages`,
        description: `The exact meta description is shared across ${urls.length} distinct URLs.`,
        whyItMatters: 'Search snippets will show identical descriptions, confusing searchers trying to choose between different pages.',
        recommendation: 'Write unique meta descriptions tailored to the specific content and purpose of each page.',
        implementationSteps: [
          'Draft tailored descriptions highlighting unique benefits for each page.',
        ],
        verificationCriteria: 'Each page has a unique meta description.',
        estimatedEffort: 'moderate',
        detectionMethod: `Cross-page analysis: description duplicated on ${urls.length} pages`,
        evidence: {
          expected: 'Unique meta descriptions for distinct URLs',
          actual: `Duplicated on: ${urls.slice(0, 3).join(', ')}${urls.length > 3 ? '...' : ''}`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Broken Internal Links (Links pointing to 4xx/5xx URLs)
  for (const page of pages) {
    const brokenLinksOnPage = page.internalLinks.filter(link => brokenPagesMap.has(link));
    if (brokenLinksOnPage.length > 0) {
      const targetUrl = brokenLinksOnPage[0];
      const targetStatus = brokenPagesMap.get(targetUrl);
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: page.url,
        category: 'technical',
        findingType: 'confirmed_error',
        issueType: 'broken_internal_link_detected',
        severity: 'high',
        priority: 'high',
        confidenceLevel: 'high',
        title: `Broken Internal Link Detected (targets HTTP ${targetStatus})`,
        description: `This page contains ${brokenLinksOnPage.length} internal link(s) pointing to dead or error pages.`,
        whyItMatters: 'Broken links disrupt user navigation and waste crawler budget by directing bots into 404 dead ends.',
        recommendation: 'Update or remove broken link references to point to active, indexable URLs.',
        implementationSteps: [
          `Locate href="${targetUrl}" on ${page.url}.`,
          'Update link destination to active URL or remove hyperlink.',
        ],
        verificationCriteria: `Internal link no longer points to HTTP ${targetStatus} URL.`,
        estimatedEffort: 'quick_fix',
        detectionMethod: `Link graph verification: found broken target ${targetUrl} (HTTP ${targetStatus}) on page`,
        evidence: {
          expected: 'Internal links target valid HTTP 200 destinations',
          actual: `Points to broken URL: ${targetUrl} (HTTP ${targetStatus})`,
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Orphan Page Candidates within Discovered URLs
  // Clearly distinguish confirmed orphan pages from undiscovered URLs
  for (const page of pages) {
    // Exclude the homepage / root URL (which naturally has no parent inlinks from external)
    if (page.url === fallbackUrl || page.url === websiteUrl) continue;

    const inlinks = pageInlinksMap.get(page.url);
    if (!inlinks || inlinks.size === 0) {
      findings.push({
        id: generateUuid(),
        auditRunId,
        websiteId,
        url: page.url,
        category: 'indexability',
        findingType: 'warning',
        issueType: 'orphan_page_candidate',
        severity: 'medium',
        priority: 'medium',
        confidenceLevel: 'medium',
        title: 'Orphan Page Candidate (0 Internal Inlinks in Crawl Graph)',
        description: 'Page was discovered (via sitemap or seed) but has 0 incoming internal links from any crawled HTML page.',
        whyItMatters: 'Orphan pages receive no internal PageRank equity, making them difficult for crawlers to re-index and users to discover.',
        recommendation: 'Add contextual internal links from relevant category, blog, or navigational pages.',
        implementationSteps: [
          'Identify relevant parent or topic-cluster articles.',
          'Add contextual inlinks pointing to this URL with descriptive anchor text.',
        ],
        verificationCriteria: 'Page receives at least 1 incoming internal link from main site navigation or body content.',
        estimatedEffort: 'quick_fix',
        detectionMethod: 'Link graph analysis: 0 internal pages linked to this URL in crawl graph',
        evidence: {
          expected: 'At least 1–2 internal links from relevant website pages',
          actual: '0 incoming internal links discovered in crawl sample',
        },
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return findings;
}
