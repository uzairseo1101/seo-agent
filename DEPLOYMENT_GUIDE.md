# RankPilot AI — Zero-Budget Deployment Guide

This guide describes how to run RankPilot AI locally with **zero cost ($0 / Rs 0)** and how to transition to Supabase and production hosting when ready.

---

## 💻 1. Local Development Mode (Rs 0 Budget)

By default, RankPilot AI runs with zero external dependencies using an in-memory dual-mode storage engine populated with realistic agency fixtures.

### Prerequisites:
- Node.js 18+ (tested on Node.js 22 LTS)
- npm or pnpm

### Quickstart:
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application:
- **Public Marketing Site**: `http://localhost:3000/`
- **Agency Dashboard**: `http://localhost:3000/dashboard`
- **Audit Launcher**: `http://localhost:3000/dashboard/audits`
- **Action Center**: `http://localhost:3000/dashboard/action-center`
- **GSC Intelligence**: `http://localhost:3000/dashboard/gsc`
- **Opportunities**: `http://localhost:3000/dashboard/opportunities`
- **Traffic Drops**: `http://localhost:3000/dashboard/traffic`
- **Alerts**: `http://localhost:3000/dashboard/alerts`
- **Client Reports**: `http://localhost:3000/dashboard/reports`
- **Trust Center**: `http://localhost:3000/dashboard/trust-center`

### Running the Test Suite:
```bash
npm test
```
All 16 automated test suites (SSRF guard, analyzers, traffic math, OAuth CSRF, verification engine, AI safety, reports, trust center, E2E customer journey) run locally in seconds.

---

## 🌐 2. Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local` to configure optional external services:

```env
# Mode Selection (default: mock)
STORAGE_MODE=mock # 'mock' or 'supabase'

# Google Gemini API (Free Tier at https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Free Tier at https://supabase.com/)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Search Console OAuth (Free via Google Cloud Console)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ 3. Connecting Supabase Free Tier

When ready to use persistent PostgreSQL:
1. Create a free account at [Supabase.com](https://supabase.com).
2. Create a new free project.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy and paste the contents of `supabase/migrations/20261101_init_schema.sql` and run it. This creates all 28 tables, indexes, and Row Level Security policies.
5. Set `STORAGE_MODE=supabase` in `.env.local` along with your Supabase URL and keys.

---

## 🚀 4. Production Hosting Considerations

> [!IMPORTANT]
> **Commercial Terms Note**:
> Vercel Hobby tier is intended for personal and non-commercial projects. Before deploying a commercial SaaS application to production, consider free or low-cost commercial-friendly alternatives such as:
> - Self-hosted Node.js / Docker on a low-cost VPS ($3.50/mo on Hetzner or free tier on Oracle Cloud / Railway free trial).
> - Vercel Pro ($20/mo) once first paying customer is onboarded.
