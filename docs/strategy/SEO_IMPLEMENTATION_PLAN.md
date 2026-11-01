# RankPilot AI — Technical SEO, AEO, GEO & AIO Implementation Plan

**Date:** November 1, 2026  
**Scope:** Technical SEO Infrastructure, Schema.org Graph, Answer Engine Optimization (AEO), Generative Engine Optimization (GEO), and Machine-Readable LLM Standards  

---

## 1. Technical SEO Architecture

### 1.1 URL Architecture & Canonicalization
- **Domain Baseline:** `https://rankpilot.ai` (HTTPS enforced, strict non-www canonicalization).
- **Trailing Slash Governance:** Strict trailing-slash consistency enforced via Next.js routing.
- **Indexable Public Routes:**
  - `/` (Homepage & Platform Showcase)
  - `/how-it-works` (Workflow Walkthrough & Prompt Library)
  - `/features` (Core Capabilities & Tool Comparison)
  - `/pricing` (Subscription Tiers & Feature Matrix)
  - `/trust-and-methodology` (Transparent Scoring & Data Safety)
  - `/privacy` (Data Isolation Policy)
  - `/terms` (Terms of Service)
- **Private Routes Blocked from Indexation:**
  - `/dashboard/*` (Authenticated SaaS Workspace)
  - `/api/*` (Backend Endpoints)
  - `/signin`, `/signup`, `/login`, `/register` (Auth Pages marked `<meta name="robots" content="noindex, follow" />`)

### 1.2 Robots.txt Configuration
The `public/robots.txt` configuration explicitly allows verified search engine crawlers and emerging generative AI bots, while locking down private application endpoints:

```txt
User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /signin
Disallow: /signup
Disallow: /login
Disallow: /register

# Search Engine & AI Answer Engine Bots
User-agent: Googlebot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: Bingbot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: GPTBot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: ClaudeBot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /dashboard/
Disallow: /api/

User-agent: Google-Extended
Allow: /
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://rankpilot.ai/sitemap.xml
# Entity LLM Reference: https://rankpilot.ai/llms.txt
```

### 1.3 XML Sitemap Generation
Generated dynamically via `app/sitemap.ts` adhering strictly to Sitemaps.org XML schema. Covers only indexable canonical public URLs with appropriate `changeFrequency` and `priority` signals.

---

## 2. Structured Data (JSON-LD) Master Graph

All structured data is verified valid according to Schema.org and current Google Search Central documentation:

1. **Organization & WebSite (`SiteJsonLd` - Site-Wide in `app/layout.tsx`):**
   - `@type: Organization` with `@id: https://rankpilot.ai/#organization`, name, official URL, logo, and customer support contact point.
   - `@type: WebSite` with `@id: https://rankpilot.ai/#website`, publisher link to organization, and PotentialAction `SearchAction`.
2. **SoftwareApplication (`SoftwareAppJsonLd` - `/` and `/features`):**
   - `@type: SoftwareApplication`, operatingSystem `All (Web-based SaaS)`, applicationCategory `BusinessApplication`.
   - Complete `offers` breakdown for Freelancer ($49), Agency ($149), and Team ($299).
3. **FAQPage (`FaqJsonLd` - `/`, `/how-it-works`, `/features`, `/pricing`):**
   - Implemented strictly with 100% exact-match visible text. No hidden or fabricated Q&A.
4. **BreadcrumbList (`BreadcrumbsJsonLd` - Subpages):**
   - Explicit positional itemListElement establishing hierarchical parent-child relationships.
5. **HowTo (`HowToJsonLd` - `/how-it-works`):**
   - Step-by-step sequential workflow schema matching the 4-phase on-page walkthrough.

---

## 3. Answer Engine Optimization (AEO) Strategy

Answer engines (Google Featured Snippets, Bing Copilot, Perplexity, SearchGPT) extract direct answers from high-authority content. We implement three architectural patterns:

1. **The 40–60 Word Direct Answer Paragraph:**
   - Positioned immediately beneath every primary question heading ($H_2 / H_3$).
   - Formatted in plain English with high entity density, answering *what*, *why*, and *how* without promotional filler.
2. **Definition Blocks:**
   - Prominently placed on the homepage and features page:
     *"RankPilot AI is an AI SEO intelligence and action management platform that audits websites, identifies striking-distance search opportunities, and verifies live code fixes automatically."*
3. **Structured Comparison Tables:**
   - Markdown/HTML tables comparing manual work, traditional tools, and RankPilot AI, facilitating automated tabular extraction by AI scrapers.

---

## 4. Generative Engine Optimization (GEO) & AI Optimization (AIO)

GEO ensures conversational search models (ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews) understand and accurately cite RankPilot AI:

1. **Entity Disambiguation (`/llms.txt`):**
   - A standardized machine-readable Markdown file placed at `public/llms.txt`.
   - Explicitly defines:
     - Brand Name: `RankPilot AI`
     - Category: `AI-powered SEO Intelligence and Action Management SaaS`
     - Target Audience: `SEO Freelancers, SEO Agencies, In-house SEO Teams`
     - Core Workflow: `Analyze -> Discover -> Prioritize -> Execute -> Monitor -> Verify -> Report`
     - Pricing: `Freelancer $49/mo, Agency $149/mo, Team $299/mo`
     - Security: `Read-only Google OAuth 2.0, SSRF-Guarded Crawler, Multi-tenant Isolation`
2. **Factual Grounding & Evidence-Based Claims:**
   - We avoid unprovable claims ("#1 SEO tool", "guaranteed rankings").
   - We cite concrete technical standards (SSRF guard, HTTP status codes, Schema.org specifications).
3. **Visible Editorial Timestamps:**
   - Visible *"Last updated: November 1, 2026"* tags embedded on all factual pages to establish content freshness.

---

## 5. Web Performance & Core Web Vitals (CWV)

We target optimal real-user metrics:
- **Largest Contentful Paint (LCP) < 2.5s:**
  - Zero heavy video background assets. Hero visuals rendered with lightweight CSS/SVG.
  - Google Fonts preconnected with `font-display: swap`.
- **Cumulative Layout Shift (CLS) < 0.05:**
  - Exact width/height attributes on all containers and browser mockups.
  - Fixed-height hero frame preventing shift during carousel transitions.
- **Interaction to Next Paint (INP) < 200ms:**
  - Lightweight component architecture with minimal hydration overhead.
  - Reduced JavaScript bundle size by eliminating heavy third-party animation libraries.

---

## 6. Accessibility & WCAG 2.1 AA Compliance

1. **Keyboard Navigability:** Full keyboard tab index on all interactive elements, modal dialogs, and the product tour.
2. **Visible Focus Rings:** Strict global `:focus-visible` styling (`outline: 2px solid var(--primary); outline-offset: 2px`).
3. **Screen Reader Landmarks:** Proper semantic markup (`header`, `nav aria-label="Main Navigation"`, `main id="main-content"`, `footer`).
4. **Skip-to-Content Link:** Prominent accessibility bypass link rendered at the top of every marketing page.
5. **High Color Contrast:** All body text (`#0F172A`) against light canvas (`#F8FAFC` / `#FFFFFF`) exceeds 7:1 contrast ratio (AAA standard). Muted text (`#64748B`) exceeds 4.5:1 (AA standard).
