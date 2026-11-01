import * as cheerio from 'cheerio';
import { validateUrlForSsrf } from './ssrf-guard';

export interface CrawledPageData {
  url: string;
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
  schemas: Array<{ type: string; data: any }>;
  internalLinks: string[];
  externalLinks: string[];
  images: Array<{ src: string; alt?: string }>;
  wordCount: number;
  hasMobileViewport: boolean;
  lang?: string;
  openGraph: {
    title?: string;
    description?: string;
    image?: string;
  };
  rawHtmlSnippet: string;
}

export interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  delayMs?: number;
  timeoutMs?: number;
  maxSizeBytes?: number;
}

export interface CrawlResult {
  pages: CrawledPageData[];
  robotsTxt: {
    accessible: boolean;
    statusCode: number;
    disallowRules: string[];
    sitemaps: string[];
  };
  sitemap: {
    accessible: boolean;
    urlCount: number;
  };
  durationMs: number;
  errors: Array<{ url: string; error: string }>;
}

const DEFAULT_USER_AGENT = 'RankPilotAI-AuditBot/1.0 (+https://rankpilot.ai/bot)';

export async function crawlWebsite(rootUrl: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  const startTime = Date.now();
  const maxPages = options.maxPages || 25;
  const maxDepth = options.maxDepth || 2;
  const delayMs = options.delayMs || 400;
  const timeoutMs = options.timeoutMs || 8000;
  const maxSizeBytes = options.maxSizeBytes || 2 * 1024 * 1024; // 2MB limit

  const rootSsrf = await validateUrlForSsrf(rootUrl);
  if (!rootSsrf.isValid || !rootSsrf.normalizedUrl) {
    throw new Error(`Invalid or blocked start URL: ${rootSsrf.error}`);
  }

  const originUrl = new URL(rootSsrf.normalizedUrl);
  const baseDomain = originUrl.hostname.toLowerCase();

  // 1. Fetch & Parse robots.txt
  const robotsTxtUrl = `${originUrl.origin}/robots.txt`;
  const robotsInfo = await fetchRobotsTxt(robotsTxtUrl, timeoutMs);

  // 2. Check sitemap
  const sitemapUrl = robotsInfo.sitemaps[0] || `${originUrl.origin}/sitemap.xml`;
  const sitemapInfo = await checkSitemap(sitemapUrl, timeoutMs);

  // 3. Crawl queue
  const queue: Array<{ url: string; depth: number }> = [{ url: rootSsrf.normalizedUrl, depth: 0 }];
  const visited = new Set<string>();
  const pages: CrawledPageData[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  while (queue.length > 0 && pages.length < maxPages) {
    const current = queue.shift()!;
    const normalized = normalizeUrl(current.url);

    if (visited.has(normalized)) continue;
    visited.add(normalized);

    // Check robots.txt disallow rules
    if (isDisallowedByRobots(normalized, robotsInfo.disallowRules)) {
      continue;
    }

    // SSRF revalidation for this hop
    const ssrfCheck = await validateUrlForSsrf(normalized);
    if (!ssrfCheck.isValid) {
      errors.push({ url: normalized, error: ssrfCheck.error || 'Blocked by SSRF guard' });
      continue;
    }

    try {
      // Throttle politely
      if (pages.length > 0 && delayMs > 0) {
        await new Promise(r => setTimeout(r, delayMs));
      }

      const pageStart = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(normalized, {
        method: 'GET',
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timer);
      const loadTimeMs = Date.now() - pageStart;

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        continue;
      }

      // Check size header if available
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength, 10) > maxSizeBytes) {
        errors.push({ url: normalized, error: 'Page exceeds 2MB memory safety limit' });
        continue;
      }

      const rawHtml = await response.text();
      const pageData = extractPageData(normalized, response.status, loadTimeMs, response.headers, rawHtml, baseDomain);
      pages.push(pageData);

      // Enqueue discovered internal links if within maxDepth
      if (current.depth < maxDepth) {
        for (const link of pageData.internalLinks) {
          const normLink = normalizeUrl(link);
          if (!visited.has(normLink) && !queue.some(q => normalizeUrl(q.url) === normLink)) {
            queue.push({ url: normLink, depth: current.depth + 1 });
          }
        }
      }
    } catch (err: any) {
      errors.push({ url: normalized, error: err.message || 'Crawl request failed' });
    }
  }

  return {
    pages,
    robotsTxt: robotsInfo,
    sitemap: sitemapInfo,
    durationMs: Date.now() - startTime,
    errors,
  };
}

function extractPageData(
  url: string,
  statusCode: number,
  loadTimeMs: number,
  headers: Headers,
  html: string,
  baseDomain: string
): CrawledPageData {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || '';
  const canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim();
  const metaRobots = $('meta[name="robots" i]').attr('content')?.trim();
  const xRobotsTag = headers.get('x-robots-tag') || undefined;
  const hasMobileViewport = Boolean($('meta[name="viewport" i]').attr('content'));
  const lang = $('html').attr('lang')?.trim();

  // Headings
  const h1Elements: string[] = [];
  $('h1').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h1Elements.push(text);
  });

  const h2Elements: string[] = [];
  $('h2').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h2Elements.push(text);
  });

  const h3Elements: string[] = [];
  $('h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text) h3Elements.push(text);
  });

  // Open Graph
  const openGraph = {
    title: $('meta[property="og:title" i]').attr('content')?.trim(),
    description: $('meta[property="og:description" i]').attr('content')?.trim(),
    image: $('meta[property="og:image" i]').attr('content')?.trim(),
  };

  // Structured Data (JSON-LD)
  const schemas: Array<{ type: string; data: any }> = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const content = $(el).html();
      if (content) {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item && item['@type']) schemas.push({ type: String(item['@type']), data: item });
          });
        } else if (parsed && parsed['@type']) {
          schemas.push({ type: String(parsed['@type']), data: parsed });
        }
      }
    } catch {
      // Ignore malformed JSON-LD in DOM
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
      const resolved = new URL(rawHref, url);
      if (resolved.hostname.toLowerCase() === baseDomain) {
        internalLinks.push(resolved.origin + resolved.pathname + resolved.search);
      } else {
        externalLinks.push(resolved.href);
      }
    } catch {
      // Ignore malformed URLs
    }
  });

  // Images
  const images: Array<{ src: string; alt?: string }> = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || $(el).attr('data-src');
    if (src) {
      images.push({
        src,
        alt: $(el).attr('alt')?.trim(),
      });
    }
  });

  // Word count estimate
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').length : 0;

  return {
    url,
    statusCode,
    loadTimeMs,
    contentType: headers.get('content-type') || 'text/html',
    title,
    metaDescription,
    canonicalUrl,
    metaRobots,
    xRobotsTag,
    h1Elements,
    h2Elements,
    h3Elements,
    schemas,
    internalLinks: Array.from(new Set(internalLinks)),
    externalLinks: Array.from(new Set(externalLinks)),
    images,
    wordCount,
    hasMobileViewport,
    lang,
    openGraph,
    rawHtmlSnippet: html.slice(0, 1500),
  };
}

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

      if (/^Sitemap:\s*(.+)/i.test(line)) {
        const match = line.match(/^Sitemap:\s*(.+)/i);
        if (match && match[1].trim()) {
          sitemaps.push(match[1].trim());
        }
      }
    }

    return { accessible: true, statusCode: res.status, disallowRules, sitemaps };
  } catch {
    return { accessible: false, statusCode: 0, disallowRules: [], sitemaps: [] };
  }
}

async function checkSitemap(url: string, timeoutMs: number) {
  try {
    const ssrf = await validateUrlForSsrf(url);
    if (!ssrf.isValid) return { accessible: false, urlCount: 0 };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { headers: { 'User-Agent': DEFAULT_USER_AGENT }, signal: controller.signal });
    clearTimeout(timer);

    if (!res.ok) return { accessible: false, urlCount: 0 };
    const text = await res.text();
    const matches = text.match(/<loc>/g);
    return { accessible: true, urlCount: matches ? matches.length : 1 };
  } catch {
    return { accessible: false, urlCount: 0 };
  }
}

function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = '';
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return `${parsed.protocol}//${parsed.hostname.toLowerCase()}${pathname}${parsed.search}`;
  } catch {
    return rawUrl;
  }
}

function isDisallowedByRobots(urlStr: string, disallowRules: string[]): boolean {
  try {
    const parsed = new URL(urlStr);
    const path = parsed.pathname;
    for (const rule of disallowRules) {
      if (rule === '/' || path.startsWith(rule)) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
