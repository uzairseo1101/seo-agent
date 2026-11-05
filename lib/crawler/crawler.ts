import * as cheerio from 'cheerio';
import { validateUrlForSsrf } from './ssrf-guard';

export interface CrawledImage {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  isMissingAlt: boolean;
}

export interface CrawledSchema {
  type: string;
  data: any;
  isValidJson: boolean;
  rawJson?: string;
  syntaxError?: string;
}

export interface CrawledPageData {
  url: string;                  // requested URL
  finalUrl: string;             // final URL after redirects
  redirectHops: string[];       // sequence of redirect URLs
  redirectCount: number;
  isRedirectChain: boolean;     // > 1 redirect hop
  isRedirectLoop: boolean;      // cycle detected in redirects
  statusCode: number;
  loadTimeMs: number;
  contentType: string;
  title: string;
  metaDescription: string;
  canonicalUrl?: string;
  metaRobots?: string;
  xRobotsTag?: string;
  h1Elements: string[];
  h2Elements: string[];
  h3Elements: string[];
  h4Elements: string[];
  h5Elements: string[];
  h6Elements: string[];
  mainContent: string;
  wordCount: number;
  internalLinks: string[];
  externalLinks: string[];
  images: CrawledImage[];
  schemas: CrawledSchema[];
  hasMobileViewport: boolean;
  lang?: string;
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
    siteName?: string;
  };
  twitterCard: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  contentEncoding?: string;
  cacheControl?: string;
  isClientSideRendered: boolean;
  isIndexable: boolean;
  isRobotsAllowed: boolean;
  renderingErrors?: string[];
  rawHtmlSnippet: string;
}

export interface CrawlProgress {
  stage: string;
  percent: number;
  discovered: number;
  crawled: number;
  remaining: number;
  failed: number;
  currentUrl?: string;
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  delayMs?: number;
  timeoutMs?: number;
  maxSizeBytes?: number;
  onProgress?: (progress: CrawlProgress) => Promise<void> | void;
}

export interface CrawlCoverage {
  discovered: number;
  crawled: number;
  skipped: number;
  failed: number;
  remaining: number;
  maxAllowedPages: number;
  limitReached: boolean;
  limitReason?: string;
}

export interface CrawlResult {
  pages: CrawledPageData[];
  discoveredUrls: string[];
  crawledUrls: string[];
  skippedUrls: Array<{ url: string; reason: string }>;
  failedUrls: Array<{ url: string; error: string }>;
  robotsTxt: {
    accessible: boolean;
    statusCode: number;
    disallowRules: string[];
    sitemaps: string[];
    crawlDelay?: number;
  };
  sitemap: {
    accessible: boolean;
    urlCount: number;
    sitemapsFound: string[];
  };
  durationMs: number;
  errors: Array<{ url: string; error: string }>;
  coverage: CrawlCoverage;
}

const DEFAULT_USER_AGENT = 'RankPilotAI-AuditBot/1.0 (+https://rankpilot.ai/bot; professional technical crawler)';
const MAX_REDIRECT_HOPS = 5;

/**
 * Normalizes a URL: strips hash fragments, lowercases host, standardizes pathname and query parameters.
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());
    parsed.hash = ''; // Remove fragment

    // Strip common tracking query params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(param => parsed.searchParams.delete(param));

    let pathname = parsed.pathname || '/';
    // Remove multiple trailing slashes (except root '/')
    pathname = pathname.replace(/\/+$/, '') || '/';
    parsed.pathname = pathname;

    return parsed.toString();
  } catch {
    return rawUrl.trim();
  }
}

/**
 * Checks if a URL path is blocked by robots.txt disallow rules.
 */
export function isDisallowedByRobots(urlStr: string, disallowRules: string[]): boolean {
  if (!disallowRules || disallowRules.length === 0) return false;
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname;
    for (const rawRule of disallowRules) {
      const rule = rawRule.trim();
      if (!rule) continue;
      if (rule === '/' || path.startsWith(rule)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Professional Multi-Source Website Crawling Engine
 */
export async function crawlWebsite(rootUrl: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const startTime = Date.now();
  const maxPages = options.maxPages || 25;
  const maxDepth = options.maxDepth || 2;
  const delayMs = options.delayMs !== undefined ? options.delayMs : 300;
  const timeoutMs = options.timeoutMs || 8000;
  const maxSizeBytes = options.maxSizeBytes || 2.5 * 1024 * 1024; // 2.5MB memory limit

  // 1. SSRF validation on the root URL
  const rootSsrf = await validateUrlForSsrf(rootUrl);
  if (!rootSsrf.isValid || !rootSsrf.normalizedUrl) {
    throw new Error(`Invalid or blocked start URL: ${rootSsrf.error || 'Security check failed'}`);
  }

  const originUrl = new URL(rootSsrf.normalizedUrl);
  const baseDomain = originUrl.hostname.toLowerCase();
  const normalizedRoot = normalizeUrl(rootSsrf.normalizedUrl);

  const discoveredUrls = new Set<string>([normalizedRoot]);
  const visitedUrls = new Set<string>();
  const crawledUrls = new Set<string>();
  const skippedUrls: Array<{ url: string; reason: string }> = [];
  const failedUrls: Array<{ url: string; error: string }> = [];
  const pages: CrawledPageData[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  // Notify initial stage
  if (options.onProgress) {
    await options.onProgress({
      stage: 'Inspecting robots.txt & discovering sitemaps',
      percent: 5,
      discovered: 1,
      crawled: 0,
      remaining: 1,
      failed: 0,
      currentUrl: normalizedRoot,
    });
  }

  // 2. Fetch & parse robots.txt
  const robotsTxtUrl = `${originUrl.origin}/robots.txt`;
  const robotsInfo = await fetchRobotsTxt(robotsTxtUrl, timeoutMs);

  // 3. Multi-source sitemap discovery
  const sitemapCandidates = [
    ...robotsInfo.sitemaps,
    `${originUrl.origin}/sitemap.xml`,
    `${originUrl.origin}/sitemap_index.xml`,
  ];
  const uniqueSitemapUrls = Array.from(new Set(sitemapCandidates));
  const sitemapInfo = await discoverSitemaps(uniqueSitemapUrls, baseDomain, timeoutMs);

  // Add sitemap-discovered URLs to discovery queue
  for (const sUrl of sitemapInfo.urls) {
    const norm = normalizeUrl(sUrl);
    discoveredUrls.add(norm);
  }

  // 4. Crawl queue initialized
  const queue: Array<{ url: string; depth: number }> = [{ url: normalizedRoot, depth: 0 }];

  // Also enqueue top URLs from sitemap up to a reasonable seed limit
  for (const sUrl of sitemapInfo.urls) {
    const norm = normalizeUrl(sUrl);
    if (norm !== normalizedRoot && queue.length < maxPages * 2) {
      queue.push({ url: norm, depth: 1 });
    }
  }

  // Calculate crawl delay (respect crawl-delay in robots.txt if provided, min 100ms, max 2000ms)
  const effectiveDelay = robotsInfo.crawlDelay ? Math.min(Math.max(robotsInfo.crawlDelay * 1000, 200), 2000) : delayMs;

  // 5. Main Crawl Loop
  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift()!;
    const normalized = normalizeUrl(current.url);

    if (visitedUrls.has(normalized)) continue;
    visitedUrls.add(normalized);

    // Check if robots.txt blocks this URL
    if (isDisallowedByRobots(normalized, robotsInfo.disallowRules)) {
      skippedUrls.push({ url: normalized, reason: 'Blocked by robots.txt directive' });
      continue;
    }

    // SSRF revalidation for this hop
    const ssrfCheck = await validateUrlForSsrf(normalized);
    if (!ssrfCheck.isValid) {
      failedUrls.push({ url: normalized, error: ssrfCheck.error || 'Blocked by SSRF boundary' });
      errors.push({ url: normalized, error: ssrfCheck.error || 'Blocked by SSRF boundary' });
      continue;
    }

    // Throttle politely
    if (pages.length > 0 && effectiveDelay > 0) {
      await new Promise(r => setTimeout(r, effectiveDelay));
    }

    // Report progress
    const currentProgressPercent = Math.min(10 + Math.round((pages.length / maxPages) * 75), 85);
    if (options.onProgress) {
      await options.onProgress({
        stage: `Crawling page ${pages.length + 1} of ${maxPages}`,
        percent: currentProgressPercent,
        discovered: discoveredUrls.size,
        crawled: pages.length,
        remaining: Math.max(0, Math.min(queue.length, maxPages - pages.length)),
        failed: failedUrls.length,
        currentUrl: normalized,
      });
    }

    try {
      // Fetch URL with controlled manual redirect tracking
      const fetchResult = await fetchWithRedirectTracking(normalized, timeoutMs, maxSizeBytes);

      if (!fetchResult.isHtml) {
        skippedUrls.push({ url: normalized, reason: `Non-HTML content-type: ${fetchResult.contentType}` });
        continue;
      }

      // Extract page intelligence
      const pageData = extractPageIntelligence(
        normalized,
        fetchResult,
        baseDomain,
        robotsInfo.disallowRules
      );

      pages.push(pageData);
      crawledUrls.add(normalized);

      // Enqueue discovered internal links if within maxDepth
      if (current.depth < maxDepth && pages.length < maxPages) {
        for (const link of pageData.internalLinks) {
          const normLink = normalizeUrl(link);
          discoveredUrls.add(normLink);
          if (!visitedUrls.has(normLink) && !queue.some(q => normalizeUrl(q.url) === normLink)) {
            queue.push({ url: normLink, depth: current.depth + 1 });
          }
        }
      }
    } catch (err: any) {
      failedUrls.push({ url: normalized, error: err.message || 'Crawl request failed' });
      errors.push({ url: normalized, error: err.message || 'Crawl request failed' });
    }
  }

  // 6. Finalize Coverage
  const limitReached = pages.length >= maxPages;
  const coverage: CrawlCoverage = {
    discovered: discoveredUrls.size,
    crawled: pages.length,
    skipped: skippedUrls.length,
    failed: failedUrls.length,
    remaining: Math.max(0, discoveredUrls.size - pages.length - skippedUrls.length - failedUrls.length),
    maxAllowedPages: maxPages,
    limitReached,
    limitReason: limitReached
      ? `Configured page limit (${maxPages} pages) reached according to workspace subscription allowance.`
      : undefined,
  };

  if (options.onProgress) {
    await options.onProgress({
      stage: 'Crawl completed. Finalizing technical evaluations',
      percent: 90,
      discovered: coverage.discovered,
      crawled: coverage.crawled,
      remaining: 0,
      failed: coverage.failed,
    });
  }

  return {
    pages,
    discoveredUrls: Array.from(discoveredUrls),
    crawledUrls: Array.from(crawledUrls),
    skippedUrls,
    failedUrls,
    robotsTxt: robotsInfo,
    sitemap: {
      accessible: sitemapInfo.accessible,
      urlCount: sitemapInfo.urls.length,
      sitemapsFound: sitemapInfo.sitemapsFound,
    },
    durationMs: Date.now() - startTime,
    errors,
    coverage,
  };
}

interface FetchTrackResult {
  requestedUrl: string;
  finalUrl: string;
  statusCode: number;
  loadTimeMs: number;
  contentType: string;
  headers: Headers;
  html: string;
  redirectHops: string[];
  isRedirectChain: boolean;
  isRedirectLoop: boolean;
  isHtml: boolean;
  contentEncoding?: string;
  cacheControl?: string;
}

/**
 * Safely fetches a URL with manual redirect chain and loop detection
 */
async function fetchWithRedirectTracking(
  startUrl: string,
  timeoutMs: number,
  maxSizeBytes: number
): Promise<FetchTrackResult> {
  const startTime = Date.now();
  let currentUrl = startUrl;
  const hops: string[] = [];
  const visitedHops = new Set<string>();
  let isRedirectLoop = false;
  let finalResponse: Response | null = null;
  let finalHeaders: Headers = new Headers();
  let finalStatus = 200;

  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    if (visitedHops.has(currentUrl)) {
      isRedirectLoop = true;
      break;
    }
    visitedHops.add(currentUrl);

    // SSRF revalidation for each redirect destination
    const hopSsrf = await validateUrlForSsrf(currentUrl);
    if (!hopSsrf.isValid || !hopSsrf.normalizedUrl) {
      throw new Error(`Redirect destination blocked by SSRF guard: ${currentUrl}`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(currentUrl, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      redirect: 'manual', // Manual tracking
      signal: controller.signal,
    });

    clearTimeout(timer);
    finalResponse = response;
    finalHeaders = response.headers;
    finalStatus = response.status;

    // Check for redirect HTTP statuses (301, 302, 303, 307, 308)
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) break;

      const nextUrl = new URL(location, currentUrl).href;
      hops.push(nextUrl);
      currentUrl = nextUrl;
      continue;
    }

    // Reached final destination
    break;
  }

  const loadTimeMs = Date.now() - startTime;
  const contentType = finalHeaders.get('content-type') || '';
  const isHtml = contentType.includes('text/html') || contentType.includes('application/xhtml+xml');

  let html = '';
  if (isHtml && finalResponse) {
    const contentLength = finalHeaders.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
      throw new Error(`Page size (${contentLength} bytes) exceeds safety limit of ${maxSizeBytes} bytes`);
    }
    html = await finalResponse.text();
  }

  return {
    requestedUrl: startUrl,
    finalUrl: currentUrl,
    statusCode: finalStatus,
    loadTimeMs,
    contentType,
    headers: finalHeaders,
    html,
    redirectHops: hops,
    isRedirectChain: hops.length > 1,
    isRedirectLoop,
    isHtml,
    contentEncoding: finalHeaders.get('content-encoding') || undefined,
    cacheControl: finalHeaders.get('cache-control') || undefined,
  };
}

/**
 * Extracts comprehensive on-page, architectural, and structured data signals
 */
function extractPageIntelligence(
  requestedUrl: string,
  fetchResult: FetchTrackResult,
  baseDomain: string,
  disallowRules: string[]
): CrawledPageData {
  const { finalUrl, statusCode, loadTimeMs, contentType, headers, html, redirectHops, isRedirectChain, isRedirectLoop, contentEncoding, cacheControl } = fetchResult;
  const $ = cheerio.load(html);

  // Metadata
  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || '';
  const canonicalHref = $('link[rel="canonical" i]').attr('href')?.trim();
  let canonicalUrl = canonicalHref;
  if (canonicalHref) {
    try {
      canonicalUrl = new URL(canonicalHref, finalUrl).href;
    } catch {
      canonicalUrl = canonicalHref;
    }
  }

  const metaRobots = $('meta[name="robots" i]').attr('content')?.trim();
  const xRobotsTag = headers.get('x-robots-tag') || undefined;
  const hasMobileViewport = Boolean($('meta[name="viewport" i]').attr('content'));
  const lang = $('html').attr('lang')?.trim();

  // Headings H1 to H6
  const getHeadings = (tag: string) => {
    const items: string[] = [];
    $(tag).each((_, el) => {
      const text = $(el).text().trim();
      if (text) items.push(text);
    });
    return items;
  };

  const h1Elements = getHeadings('h1');
  const h2Elements = getHeadings('h2');
  const h3Elements = getHeadings('h3');
  const h4Elements = getHeadings('h4');
  const h5Elements = getHeadings('h5');
  const h6Elements = getHeadings('h6');

  // Open Graph
  const openGraph = {
    title: $('meta[property="og:title" i]').attr('content')?.trim(),
    description: $('meta[property="og:description" i]').attr('content')?.trim(),
    image: $('meta[property="og:image" i]').attr('content')?.trim(),
    url: $('meta[property="og:url" i]').attr('content')?.trim(),
    type: $('meta[property="og:type" i]').attr('content')?.trim(),
    siteName: $('meta[property="og:site_name" i]').attr('content')?.trim(),
  };

  // Twitter Card
  const twitterCard = {
    card: $('meta[name="twitter:card" i]').attr('content')?.trim() || $('meta[property="twitter:card" i]').attr('content')?.trim(),
    title: $('meta[name="twitter:title" i]').attr('content')?.trim() || $('meta[property="twitter:title" i]').attr('content')?.trim(),
    description: $('meta[name="twitter:description" i]').attr('content')?.trim() || $('meta[property="twitter:description" i]').attr('content')?.trim(),
    image: $('meta[name="twitter:image" i]').attr('content')?.trim() || $('meta[property="twitter:image" i]').attr('content')?.trim(),
  };

  // Structured Data (JSON-LD & Microdata)
  const schemas: CrawledSchema[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const content = $(el).html();
    if (!content) return;
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          if (item && item['@type']) {
            schemas.push({ type: String(item['@type']), data: item, isValidJson: true, rawJson: content });
          }
        });
      } else if (parsed && parsed['@type']) {
        schemas.push({ type: String(parsed['@type']), data: parsed, isValidJson: true, rawJson: content });
      } else {
        schemas.push({ type: 'Thing', data: parsed, isValidJson: true, rawJson: content });
      }
    } catch (syntaxErr: any) {
      schemas.push({
        type: 'InvalidJSON-LD',
        data: null,
        isValidJson: false,
        rawJson: content.slice(0, 500),
        syntaxError: syntaxErr.message,
      });
    }
  });

  // Microdata item types
  $('[itemtype]').each((_, el) => {
    const itemType = $(el).attr('itemtype') || '';
    if (itemType) {
      schemas.push({ type: itemType, data: { format: 'microdata' }, isValidJson: true });
    }
  });

  // Links
  const internalLinks: string[] = [];
  const externalLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const rawHref = $(el).attr('href')?.trim();
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      return;
    }
    try {
      const resolved = new URL(rawHref, finalUrl);
      if (resolved.hostname.toLowerCase() === baseDomain || resolved.hostname.toLowerCase().endsWith(`.${baseDomain}`)) {
        internalLinks.push(normalizeUrl(resolved.href));
      } else {
        externalLinks.push(resolved.href);
      }
    } catch {
      // Ignore malformed href
    }
  });

  // Images
  const images: CrawledImage[] = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src') || $(el).attr('data-lazy-src');
    if (src) {
      const alt = $(el).attr('alt');
      const isMissingAlt = alt === undefined || alt === null || alt.trim() === '';
      images.push({
        src,
        alt: alt ? alt.trim() : undefined,
        width: $(el).attr('width') || undefined,
        height: $(el).attr('height') || undefined,
        isMissingAlt,
      });
    }
  });

  // Main content & word count
  // Remove non-content tags before extracting text
  const contentClone = $('body').clone();
  contentClone.find('nav, header, footer, script, style, noscript, svg').remove();
  const mainContentText = contentClone.text().replace(/\s+/g, ' ').trim();
  const wordCount = mainContentText ? mainContentText.split(' ').filter(Boolean).length : 0;

  // Client-Side Rendering Detection
  // Check if root or next container has virtually empty initial HTML
  const rootHtml = $('#root, #__next, #app').html()?.trim() || '';
  const isClientSideRendered = (html.includes('id="root"') || html.includes('id="__next"') || html.includes('id="app"')) &&
    wordCount < 60 && !html.includes('<article') && !html.includes('<main');

  // Indexability check
  const hasNoindexMeta = metaRobots ? /noindex/i.test(metaRobots) : false;
  const hasNoindexHeader = xRobotsTag ? /noindex/i.test(xRobotsTag) : false;
  const isRobotsAllowed = !isDisallowedByRobots(finalUrl, disallowRules);
  const isIndexable = statusCode === 200 && !hasNoindexMeta && !hasNoindexHeader && isRobotsAllowed;

  return {
    url: requestedUrl,
    finalUrl,
    redirectHops,
    redirectCount: redirectHops.length,
    isRedirectChain,
    isRedirectLoop,
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
    h4Elements,
    h5Elements,
    h6Elements,
    mainContent: mainContentText.slice(0, 2000),
    wordCount,
    internalLinks: Array.from(new Set(internalLinks)),
    externalLinks: Array.from(new Set(externalLinks)),
    images,
    schemas,
    hasMobileViewport,
    lang,
    openGraph,
    twitterCard,
    contentEncoding,
    cacheControl,
    isClientSideRendered,
    isIndexable,
    isRobotsAllowed,
    rawHtmlSnippet: html.slice(0, 1500),
  };
}

/**
 * Discovers and parses sitemaps, supporting standard sitemaps and sitemap index files
 */
async function discoverSitemaps(
  sitemapUrls: string[],
  baseDomain: string,
  timeoutMs: number
): Promise<{ accessible: boolean; urls: string[]; sitemapsFound: string[] }> {
  const discoveredUrls: Set<string> = new Set();
  const sitemapsFound: string[] = [];

  for (const sUrl of sitemapUrls) {
    try {
      const ssrf = await validateUrlForSsrf(sUrl);
      if (!ssrf.isValid) continue;

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(sUrl, {
        headers: { 'User-Agent': DEFAULT_USER_AGENT },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (!res.ok) continue;

      const text = await res.text();
      sitemapsFound.push(sUrl);

      // Check if sitemap index
      if (text.includes('<sitemapindex')) {
        const subSitemaps = extractXmlLocs(text);
        for (const subUrl of subSitemaps.slice(0, 5)) { // Max 5 sub-sitemaps
          try {
            const subSsrf = await validateUrlForSsrf(subUrl);
            if (!subSsrf.isValid) continue;

            const subController = new AbortController();
            const subTimer = setTimeout(() => subController.abort(), timeoutMs);
            const subRes = await fetch(subUrl, {
              headers: { 'User-Agent': DEFAULT_USER_AGENT },
              signal: subController.signal,
            });
            clearTimeout(subTimer);

            if (subRes.ok) {
              const subText = await subRes.text();
              const subUrls = extractXmlLocs(subText);
              subUrls.forEach(u => {
                if (isSameDomain(u, baseDomain)) discoveredUrls.add(u);
              });
            }
          } catch {
            // Ignore sub-sitemap failures
          }
        }
      } else {
        const directUrls = extractXmlLocs(text);
        directUrls.forEach(u => {
          if (isSameDomain(u, baseDomain)) discoveredUrls.add(u);
        });
      }
    } catch {
      // Sitemap not found or inaccessible
    }
  }

  return {
    accessible: sitemapsFound.length > 0,
    urls: Array.from(discoveredUrls),
    sitemapsFound,
  };
}

function extractXmlLocs(xml: string): string[] {
  const matches = xml.match(/<loc>([^<]+)<\/loc>/gi);
  if (!matches) return [];
  return matches
    .map(m => m.replace(/<\/?loc>/gi, '').trim())
    .filter(Boolean);
}

function isSameDomain(urlStr: string, baseDomain: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    return host === baseDomain || host.endsWith(`.${baseDomain}`);
  } catch {
    return false;
  }
}

/**
 * Fetches and parses robots.txt
 */
async function fetchRobotsTxt(url: string, timeoutMs: number) {
  try {
    const ssrf = await validateUrlForSsrf(url);
    if (!ssrf.isValid) {
      return { accessible: false, statusCode: 0, disallowRules: [], sitemaps: [] };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { headers: { 'User-Agent': DEFAULT_USER_AGENT }, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) {
      return { accessible: false, statusCode: res.status, disallowRules: [], sitemaps: [] };
    }

    const text = await res.text();
    const lines = text.split('\n');
    const disallowRules: string[] = [];
    const sitemaps: string[] = [];
    let crawlDelay: number | undefined;
    let isUniversalAgent = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('#')) continue;

      if (/^User-agent:\s*\*/i.test(line) || /^User-agent:\s*RankPilotAI/i.test(line)) {
        isUniversalAgent = true;
      } else if (/^User-agent:/i.test(line)) {
        isUniversalAgent = false;
      }

      if (isUniversalAgent && /^Disallow:\s*(.+)/i.test(line)) {
        const match = line.match(/^Disallow:\s*(.+)/i);
        if (match && match[1].trim()) {
          disallowRules.push(match[1].trim());
        }
      }

      if (isUniversalAgent && /^Crawl-delay:\s*([0-9.]+)/i.test(line)) {
        const match = line.match(/^Crawl-delay:\s*([0-9.]+)/i);
        if (match && match[1]) {
          crawlDelay = parseFloat(match[1]);
        }
      }

      if (/^Sitemap:\s*(.+)/i.test(line)) {
        const match = line.match(/^Sitemap:\s*(.+)/i);
        if (match && match[1].trim()) {
          sitemaps.push(match[1].trim());
        }
      }
    }

    return { accessible: true, statusCode: res.status, disallowRules, sitemaps, crawlDelay };
  } catch {
    return { accessible: false, statusCode: 0, disallowRules: [], sitemaps: [] };
  }
}
