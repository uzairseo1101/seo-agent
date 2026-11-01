# RankPilot AI — System Architecture & Design

## 1. High-Level System Overview

RankPilot AI operates on an action-oriented intelligence model:

```
[Target Website HTML / Headers] ──> [Safe Anti-SSRF Crawler] ──> [Technical / GEO / AEO Evaluators]
                                                                                │
                                                                                ▼
[Google Search Console API] ───────> [GSC Sync & Opportunity Engine] ──> [Deterministic Rules]
                                                                                │
                                                                                ▼
                                                                     [RankPilot AI Orchestrator]
                                                                                │
                                                                                ▼
                                                                     [Action Center Tasks]
                                                                                │
                                                                                ▼
                                                                     [Re-Audit Verification Engine]
```

---

## 2. Security Boundaries

### 2.1 Anti-SSRF Crawler Architecture
- Pre-resolves domain DNS to ensure destination IPs are not within private or internal cloud ranges:
  - Loopbacks: `127.0.0.0/8`, `::1`
  - RFC 1918 Private: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
  - Link-Local & Cloud Metadata: `169.254.169.254`, `fe80::/10`
- Revalidates every redirect hop destination.
- Limits crawler to ports 80 and 443.
- Enforces depth (default: 2) and page limits (default: 25) with a 500ms delay between fetches.

### 2.2 Prompt Injection Defense
- Webpage HTML, headings, and metadata are untrusted input.
- Webpage content is never concatenated directly into model system prompts.
- Webpage strings are wrapped in isolated `<crawled_content>` blocks and treated strictly as passive data.

### 2.3 Row Level Security (RLS)
- Every query is partitioned by `organization_id`.
- Members cannot query, update, or delete records belonging to another organization.

---

## 3. Directory Layout
```
├── app/
│   ├── (auth)/             # Login, Register, Forgot Password
│   ├── (marketing)/        # 17 Public marketing, solutions & legal pages
│   ├── dashboard/          # Complete SaaS agency workspace
│   ├── globals.css         # Tailwind & theme variables
│   └── layout.tsx          # Root HTML layout with OpenGraph SEO
├── components/
│   ├── dashboard-header.tsx
│   ├── dashboard-sidebar.tsx
│   ├── marketing-footer.tsx
│   └── marketing-nav.tsx
├── lib/
│   ├── mock-data.ts        # High-fidelity realistic development fixtures
│   ├── storage.ts          # Unified local & Supabase storage adapter
│   ├── supabase.ts         # Supabase client initializer
│   ├── types.ts            # Core TypeScript schemas
│   └── utils.ts            # Formatting & utility functions
└── supabase/
    └── migrations/         # 28-table PostgreSQL schema with RLS
```
