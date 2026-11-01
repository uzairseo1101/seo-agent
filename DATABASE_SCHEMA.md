# RankPilot AI — Database Architecture & Schema Specification

RankPilot AI utilizes a multi-tenant PostgreSQL schema designed for Supabase with **Row Level Security (RLS)** enabled across all tables.

The complete executable migration script is located at:
`supabase/migrations/20261101_init_schema.sql`

---

## 🏛️ Multi-Tenant Architecture

- **Root Tenant Entity**: `organizations`
- **Ownership & Access**: Users are linked to organizations via `organization_members` with roles: `owner`, `admin`, `member`, `viewer`.
- **Isolation Principle**: Every website, audit run, task, finding, and notification references `organization_id` or cascades through `website_id`.
- **Security**: PostgreSQL RLS policies enforce that users can only select, insert, update, or delete data belonging to their organization membership.

---

## 📊 Complete Table Directory (28 Tables)

### 1. Identity & Multi-Tenancy Core
1. `organizations`: Tenant accounts (e.g. Agency name, slug, plan tier).
2. `organization_members`: Role-based membership linking Supabase `auth.users` to organizations.
3. `profiles`: Extended user profile metadata (full name, avatar URL, preferences).
4. `subscriptions`: Billing and tier status (Free tier default, usage tier overrides).
5. `usage_records`: Tracks monthly crawl quotas, AI interpretation counts, and audit limits.

### 2. Website & Property Management
6. `websites`: Monitored client properties (domain, root URL, GSC property URL, status).
7. `website_settings`: Per-property crawling depth, notification preferences, schedule overrides.
8. `gsc_tokens`: Encrypted Google OAuth refresh tokens and granted scope metadata.

### 3. Auditing & Technical Analysis Engine
9. `audit_runs`: Audit execution header (scores, crawled page count, execution duration, status).
10. `crawled_pages`: Details of crawled URLs (HTTP status, title, meta description, word count, load time).
11. `audit_findings`: Discovered technical, GEO, and AEO issues with evidence and severity.
12. `technical_checks`: Granular pass/fail results for the 30+ technical SEO rule checks.
13. `page_schemas`: Discovered Schema.org JSON-LD and microdata structures.
14. `page_headings`: Extracted H1/H2/H3 tag hierarchy and question patterns.

### 4. GEO & AEO Intelligence
15. `geo_signals`: Brand entity, author credentials, citation density, and machine-readability metrics.
16. `aeo_signals`: Conversational query alignment, FAQ presence, and direct answer density scores.

### 5. Google Search Console & Traffic Drops
17. `gsc_search_performance`: 28-day rolled search analytics (query, page, device, country, clicks, impressions, CTR, position).
18. `gsc_sync_logs`: Historical sync logs with latency offsets and ingested row counts.
19. `seo_opportunities`: High-potential targets (striking distance, high impression / low CTR).
20. `traffic_drop_investigations`: 28-day vs previous 28-day comparisons with root-cause hypotheses.

### 6. Action Center & Task Verification
21. `action_items`: Prioritized tasks generated from findings or manual entry.
22. `verification_runs`: Automated re-crawl execution log verifying if an issue was fixed.
23. `task_activity_log`: Audit trail of task status transitions and team assignments.

### 7. AI Intelligence & Prompts
24. `ai_analyses`: Stored Gemini structured interpretations, action plans, and impact estimates.
25. `prompt_audit_logs`: Audit trail of sanitized AI prompts, execution token usage, and latency.

### 8. Notifications, Reports & Trust Center
26. `notifications`: Multi-channel in-app alerts (critical findings, verification successes, drops).
27. `client_reports`: Saved white-label executive client reports with verified work summaries.
28. `finding_feedback`: Human-in-the-loop accuracy ratings (confirmed, false positive, non-applicable).

---

## 🔒 Row Level Security (RLS) Policies

Every table has RLS explicitly enabled:
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;
-- (enabled on all 28 tables)
```

Example Policy for Organization Isolation:
```sql
CREATE POLICY "Users can view websites in their organizations"
ON websites FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members
    WHERE user_id = auth.uid()
  )
);
```
