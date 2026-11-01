# RankPilot AI

> **AI-Powered SEO Intelligence & Action Management SaaS for Agencies**  
> *"Connect your website. Discover SEO, GEO and AEO opportunities. Get prioritized actions, monitor performance and verify improvements with AI-powered intelligence."*

---

## 🚀 The Operational Workflow
```
CONNECT ➔ ANALYZE ➔ DISCOVER ➔ PRIORITIZE ➔ NOTIFY ➔ EXECUTE ➔ VERIFY ➔ REPORT
```

RankPilot AI bridges the gap between diagnostic audits and actual agency execution. Unlike traditional tools that merely spit out PDF audits, RankPilot AI:
1. **Audits** websites with safe, anti-SSRF in-house crawling.
2. **Evaluates** technical SEO, GEO (Generative Engine Optimization) entity clarity, and AEO (Answer Engine Optimization) direct-answer signals.
3. **Mines** Google Search Console data for striking-distance queries (positions 5–20) and 28-day organic traffic drops.
4. **Prioritizes** fixes into actionable agency tasks.
5. **Verifies** that completed tasks actually resolved issues through automated re-audits.
6. **Produces** executive client reports with verified improvements.

---

## 🛠️ Technology Stack (Zero-Budget Architecture)
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui primitives, Lucide Icons
- **Data Visualizations**: Recharts
- **HTML Parsing**: Cheerio (Server-side DOM inspection)
- **Database**: Supabase PostgreSQL with Row Level Security (RLS) + Local In-Memory Mock Adapter
- **Authentication**: Supabase Auth + Local Instant Dev Session
- **Integrations**: Google Search Console OAuth 2.0 (`webmasters.readonly`), Google Gemini Free Tier

---

## 🏃 Getting Started (Local Development)

### 1. Clone & Install
```bash
git clone <repo-url>
cd "SEO Agent"
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(By default, `STORAGE_MODE=mock`, meaning the application runs instantly with 0 setup and $0 spend!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the marketing site or [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to view the agency workspace.

---

## 📄 License & Safety
Built for modern digital marketing and SEO agencies. Read-only safety guaranteed.
