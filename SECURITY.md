# RankPilot AI — Security Architecture & Guidelines

RankPilot AI enforces an aggressive defense-in-depth posture to protect user data, infrastructure, and downstream client properties.

---

## 🛡️ 1. Anti-SSRF Crawler Guard (`lib/crawler/ssrf-guard.ts`)

Web crawlers and automated verification re-crawlers operate under strict Server-Side Request Forgery (SSRF) restrictions.

### Blocked Target Destinations:
1. **Loopback Addresses**: `127.0.0.1`, `localhost`, `::1`, `0.0.0.0`.
2. **RFC-1918 Private IP Ranges**:
   - `10.0.0.0/8`
   - `172.16.0.0/12`
   - `192.168.0.0/16`
3. **Cloud Metadata Endpoints**: `169.254.169.254` (AWS, GCP, Azure metadata services).
4. **Link-Local & Multicast**: `169.254.0.0/16`, `224.0.0.0/4`.
5. **Non-Standard Network Ports**: Only standard web ports `80` (HTTP) and `443` (HTTPS) are permitted. All others (e.g. `22`, `3306`, `5432`, `8080`, `6379`) are blocked before DNS resolution or HTTP connection attempt.

### Enforcement Mechanism:
Before issuing any HTTP fetch, `validateTargetUrl(targetUrl)` decomposes the URL, performs hostname normalization, checks against denylists, and validates against prohibited prefixes and patterns.

---

## 🔒 2. AI Prompt Injection Firewall (`lib/ai/prompt-sanitizer.ts`)

Untrusted web content (e.g. malicious client web pages, hidden `display:none` prompt injection payloads, or manipulated meta tags) can attempt to trick the LLM into ignoring system rules or producing harmful advice.

### Security Defenses:
1. **Instruction Disregard Striping**: Removes attempts like `"ignore previous instructions"`, `"system override"`, `"you are now in developer mode"`, and markdown code breakout attempts.
2. **Rigid XML Enclosure**: All raw crawled HTML text, title tags, and meta descriptions are strictly encapsulated within `<untrusted_crawled_data>` XML blocks.
3. **Meta-Prompt Enforcement**: The system prompt explicitly instructs the LLM that content within `<untrusted_crawled_data>` represents untrusted third-party website evidence and must never be interpreted as developer instructions.
4. **Structured Output Validation**: All AI responses are validated against a strict Zod schema (`lib/ai/schemas.ts`). Any malformed, non-JSON, or off-schema output is discarded, falling back safely to deterministic rule-based output.

---

## 🔑 3. Google OAuth 2.0 & Token Safety (`lib/gsc/oauth.ts`)

1. **Read-Only Scopes**: Only `https://www.googleapis.com/auth/webmasters.readonly` is requested. RankPilot AI has zero capability to alter sitemaps, modify verification tokens, or touch production search settings.
2. **One-Time CSRF State Tokens**: Every authorization initiation generates a cryptographic random token stored with an expiration window and organization/user binding. The callback verifies and consumes the token once.
3. **Encrypted Storage**: Refresh tokens are stored securely and never transmitted to the browser client or logged.

---

## 👥 4. Multi-Tenant Row Level Security (RLS)

All database queries are scoped by PostgreSQL Row Level Security.
- Direct organization queries check `organization_members.user_id = auth.uid()`.
- Cascaded tables (e.g. `audit_runs`, `action_items`, `seo_opportunities`) join against authorized websites or organizations.
- In-memory mock storage replicates this isolation by requiring `organizationId` or `websiteId` scoping on all data retrieval methods.

---

## 🚦 5. Zero-Budget Rate Limiting & Resource Caps

1. **Crawler Size Cap**: Capped at 2MB per crawled page to prevent memory exhaustion from giant binary payloads.
2. **Crawl Timeout**: Hard 8,000ms timeout per page request.
3. **Politeness Delay**: Crawl requests include polite delays and respect `User-Agent: RankPilotBot/1.0 (+https://rankpilot.ai/bot)`.
4. **Audit Scope**: Capped at 25 pages maximum for free tier audits to eliminate runaway resource consumption.
