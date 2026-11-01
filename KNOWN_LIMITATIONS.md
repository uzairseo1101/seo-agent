# RankPilot AI — Known MVP Limitations & Future Roadmap

To preserve strict zero-budget compliance and ensure bulletproof reliability during initial agency pilot customer validation, RankPilot AI MVP incorporates well-defined technical and operational boundaries.

---

## 📋 Current MVP Boundaries

### 1. In-House Crawler
- **Max Crawl Depth**: 2 levels.
- **Max Pages Per Audit**: Capped at 25 pages per run in free tier to prevent server memory exhaustion.
- **JavaScript Rendering**: Static HTML parsing via Cheerio. Heavy Single Page Applications (SPAs) relying entirely on client-side JS hydration may not reveal dynamic DOM nodes without a headless browser (Puppeteer / Playwright). Full headless crawling is scheduled for paid tier post-revenue.
- **Size Cap**: 2MB per page response cap.

### 2. Google Search Console API
- **Data Latency**: Google Search Console API enforces an inherent 2 to 3-day data latency window. RankPilot AI's sync engine respects this and filters queries accordingly.
- **OAuth Quota**: Free tier Google Cloud OAuth credentials allow 10,000 queries per day, sufficient for hundreds of client properties.
- **Read-Only Scopes**: RankPilot AI does not modify search properties or submit sitemaps directly; all changes are guided through Action Center tasks.

### 3. AI Recommendations
- **Model**: Google Gemini 1.5 Flash (free tier at Google AI Studio) with deterministic rule-based offline fallback.
- **Rate Limits**: Free tier allows 15 RPM (Requests Per Minute) and 1,500 RPD (Requests Per Day). Offline fallback engages seamlessly if quota is temporarily reached.
- **Output Validation**: All recommendations must adhere to the Zod schema; non-conforming responses revert to validated deterministic rule templates.

### 4. Billing & Checkout
- **Pakistan-Based Merchant Integration**: Stripe is not natively available for direct merchant registration in Pakistan without a foreign entity (e.g. Stripe Atlas Delaware LLC or UK Ltd). Automatic checkout is deliberately deferred until entity registration is complete. Free trials and direct invoice/bank payments are recommended for pilot agency onboarding.

### 5. Multi-User Team Collaboration
- Database schema and RLS policies natively support multi-user organizations and roles (`owner`, `admin`, `member`, `viewer`). UI invitation flows are prepared for Phase 10 post-launch expansion.

---

## 🔮 Post-Revenue Upgrade Roadmap

1. **Phase 10 — Headless Crawler Add-on**: Optional Puppeteer / Browserless micro-worker for heavy React/Vue SPA websites.
2. **Phase 11 — Scheduled Auto-Audits**: Cron jobs for weekly automated re-audits and monthly executive report dispatch.
3. **Phase 12 — White-Label Client Portal**: Custom subdomains (e.g. `seo.agencyname.com`) for agency client self-service logins.
