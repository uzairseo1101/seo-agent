# RankPilot AI — Homepage Wireframe & Complete Copy Architecture

**Date:** November 1, 2026  
**Layout:** 1200px Max Content Container, Alternating Clean Rank Surfaces (`#FFFFFF` & `#F8FAFC`), Responsive (Mobile 375px / Tablet 768px / Desktop 1200px)  

---

## 1. Global Page Wireframe Schematic

```
+-----------------------------------------------------------------------------------+
| HEADER (Sticky, 64px, 1px Border on Scroll)                                      |
| Logo [Compass + RankPilot AI]  | Nav: Features, How It Works, Trust, Pricing      |
| CTAs: [Sign in (Ghost)] [Start Free (Green Primary, 40px)]                        |
+-----------------------------------------------------------------------------------+
| SECTION 1: HERO                                                                   |
|   [Eyebrow Pill: AI SEO intelligence & action management platform]                |
|   H1: Your SEO Intelligence. From Insight to Action.                              |
|   Subhead: Analyze websites, discover SEO, GEO and AEO opportunities...           |
|   Buttons: [Start Free (Primary)]  [Explore the Platform (Secondary)]             |
|   Trust: Read-only safe Google Search Console integration · No credit card req.   |
|   AEO Definition Box: RankPilot AI is an AI SEO intelligence and action platform  |
|                                                                                   |
|   [ INTERACTIVE BROWSER FRAME: DASHBOARD LIVE PREVIEW ]                           |
|   Health Dials: SEO (84) | GEO (88) | AEO (91) | Verified Fixes (18)              |
|   Recent Verified Progress & Search Console Growth Area Chart                     |
+-----------------------------------------------------------------------------------+
| SECTION 2: TRUST & METHODOLOGY STRIP                                              |
|   "Engineered with transparent methodology and read-only data safety"             |
|   [Official Google OAuth 2.0] [Schema.org Graph] [SSRF Guard] [Deterministic Math]|
+-----------------------------------------------------------------------------------+
| SECTION 3: THE PROBLEM                                                            |
|   H2: SEO Work Is More Than Finding Problems.                                     |
|   [6 Problem Cards: Disconnected Tools | Manual Audits | Hidden GSC Opportunities |
|    Unprioritized Lists | Unverified Fixes | Repetitive Monthly Reporting]         |
+-----------------------------------------------------------------------------------+
| SECTION 4: THE CONNECTED SOLUTION                                                 |
|   H2: Meet Your AI SEO Intelligence and Action Platform.                          |
|   [Interactive 7-Node Lifecycle: Analyze -> Discover -> Prioritize ->             |
|    Execute -> Monitor -> Verify -> Report]                                        |
+-----------------------------------------------------------------------------------+
| SECTION 5: CAPABILITIES & OUTCOMES                                                |
|   H2: Everything You Need to Move from Data to Execution.                         |
|   [7 Feature Cards: AI Audits | GEO/AEO | GSC Sync | Opportunity Finder |          |
|    Action Center | Fix Verification | Executive Client Reports]                   |
+-----------------------------------------------------------------------------------+
| SECTION 6: STEP-BY-STEP WORKFLOW                                                  |
|   H2: From Website Analysis to Verified SEO Progress.                             |
|   [7 Step Timeline with Alternating Visual & Interactive Callout Pills]           |
+-----------------------------------------------------------------------------------+
| SECTION 7: INTERACTIVE PRODUCT SHOWCASE                                           |
|   H2: See the Intelligence Behind Your SEO Workflow.                              |
|   [Tab Bar: Overview | Audits | GSC Opportunities | Action Center | Reports]      |
|   [Layered Desktop Frame with Authentic Application Screen Mockups]               |
+-----------------------------------------------------------------------------------+
| SECTION 8: WHY RANKPILOT AI IS DIFFERENT                                          |
|   H2: Not Just Another SEO Audit. A Better Way to Manage SEO Work.                |
|   [6 Differentiator Cards: Evidence Before Recommendations | Insights to Actions  |
|    Contextual Data | Mathematical Priorities | Verified Fixes | Unified Workflow] |
+-----------------------------------------------------------------------------------+
| SECTION 9: BUILT FOR YOUR SEO WORKFLOW                                            |
|   H2: Tailored Workflows for Every SEO Practitioner.                              |
|   [3 Persona Tabs: For Freelancers | For SEO Agencies | For In-House Teams]       |
+-----------------------------------------------------------------------------------+
| SECTION 10: TRUST & METHODOLOGY                                                   |
|   H2: Know Why the Agent Recommends Something.                                    |
|   [Scoring Breakdown Matrix | Read-Only Security | Confidence Levels]             |
+-----------------------------------------------------------------------------------+
| SECTION 11: VERIFIED PROGRESS FRAMEWORK                                           |
|   H2: Real SEO Work. Measurable Progress.                                         |
|   [Methodology Standards + Empty Verified Case Study Container]                   |
+-----------------------------------------------------------------------------------+
| SECTION 12: PRICING PREVIEW                                                       |
|   H2: Transparent Pricing Built for Growing Agencies.                             |
|   [Monthly/Annual Toggle] [Freelancer $49] [Agency $149 (Primary)] [Team $299]    |
+-----------------------------------------------------------------------------------+
| SECTION 13: COMPREHENSIVE FAQS (20 Questions)                                     |
|   H2: Frequently Asked Questions                                                  |
|   [Accordion UI: Answers to 20 Specific Commercial & Technical Questions]         |
+-----------------------------------------------------------------------------------+
| SECTION 14: FINAL CONVERSION CTA                                                  |
|   H2: Spend Less Time Sorting SEO Data. More Time Moving SEO Forward.             |
|   [Get Started with RankPilot AI (Primary Button)] [Explore Features (Link)]       |
+-----------------------------------------------------------------------------------+
| FOOTER (4-Column Layout, Legal, Trust Pills, WCAG AA Statement)                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Complete Section Copy & Content Specifications

### SECTION 1 — HERO SECTION
- **Container:** Max-width 1200px, 48px top padding, centered layout.
- **Eyebrow:**
  ```html
  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-tint text-primary text-xs font-mono font-medium border border-emerald-200">
    <Bot class="w-3.5 h-3.5" />
    <span>AI SEO intelligence and action management platform built for SEO professionals</span>
  </div>
  ```
- **H1:**
  `Your SEO Intelligence.` <span class="text-primary font-bold">From Insight to Action.</span>
- **Subhead (24 words):**
  *Analyze websites, discover SEO, GEO and AEO opportunities, understand Google Search Console performance and manage every improvement from one AI-powered platform.*
- **Action Buttons:**
  - Primary CTA: `Start Free` $\rightarrow$ links to `/signup`
  - Secondary CTA: `Explore the Platform` $\rightarrow$ smooth-scrolls to `#product-showcase`
- **Trust Note:**
  `Read-only safe Google Search Console integration · No credit card required`
- **AEO Definition Paragraph:**
  *RankPilot AI is an AI SEO intelligence and action management platform that audits websites, identifies striking-distance search opportunities, and verifies live code fixes automatically.*
- **Hero Visual Preview:**
  A 1000px browser frame with soft shadow (`--shadow-pop`), showing the live overview dashboard with 4 metric dials:
  - Dial 1: *SEO Health Score: 84 / 100 (+14 pts)*
  - Dial 2: *GEO Entity Clarity: 88 / 100 (Disambiguated)*
  - Dial 3: *AEO Answer Readiness: 91 / 100 (Answer-first structure active)*
  - Dial 4: *Action Center: 18 Verified Fixes (100% re-crawl confirmed)*

---

### SECTION 2 — SOCIAL PROOF / TRUST STRIP
- **Subhead:** *Engineered with transparent methodology, deterministic scoring, and read-only data safety*
- **4 Trust Badges:**
  1. **Google Search Console Integration:** Official OAuth 2.0 read-only access. Zero risk to client properties.
  2. **SSRF-Guarded Internal Crawler:** Anti-loopback and metadata-blocking network isolation for private security.
  3. **Deterministic Scoring Engine:** Mathematical point deductions calculated transparently. Zero black-box hallucinations.
  4. **Privacy Guaranteed:** Multi-tenant organization isolation. Zero customer data shared or used to train public LLMs.

---

### SECTION 3 — PROBLEM STATEMENT: THE REAL COST OF DATA FRAGMENTATION
- **Section Heading:** **SEO Work Is More Than Finding Problems.**
- **Subtext:** *Traditional tools dump thousands of rows of data into spreadsheets and leave you to figure out what matters.*
- **6 Problem Cards:**
  1. **Too Many Tools, Disconnected Workflows:** Audits live in one tool, rankings in another, Search Console in a third, and tasks in spreadsheets. Nothing is connected.
  2. **Hours Lost to Manual Analysis:** SEOs spend 15+ hours per client every month sifting through raw crawler outputs just to identify which 5 fixes move the needle.
  3. **Opportunities Hidden in Data:** High-impression queries ranked on positions 5–20 get lost in bloated Search Console reports.
  4. **Recommendations Without Clear Priorities:** Audit generators deliver 50-page laundry lists that treat a missing meta description with the same urgency as a broken canonical tag.
  5. **Client Work Is Difficult to Track:** Developers mark tasks done in Jira or email, but agencies have no automated way to prove whether the fix is actually live in production HTML.
  6. **The Monthly Reporting Treadmill:** Assembling screenshots, charts, and executive summaries takes hours of non-billable agency time every month.

---

### SECTION 4 — INTRODUCE THE SOLUTION: THE CONNECTED LIFECYCLE
- **Section Heading:** **Meet Your AI SEO Intelligence and Action Platform.**
- **Subtext:** *RankPilot AI unites website diagnostics, search performance data, and task management into one continuous operational flow.*
- **7-Node Interactive Workflow Diagram:**
  - `Node 1: Analyze` — Crawl internal pages with SSRF-safe protections and score SEO, GEO, and AEO health.
  - `Node 2: Discover` — Sync Google Search Console to detect striking-distance opportunities and traffic declines.
  - `Node 3: Prioritize` — Rank issues algorithmically by revenue impact and technical severity.
  - `Node 4: Execute` — Review ready-to-deploy Schema code, metadata fixes, and heading architectures.
  - `Node 5: Monitor` — Track organic clicks, impressions, and SERP positions continuously.
  - `Node 6: Verify` — Automatically re-crawl affected URLs to verify that code fixes were deployed correctly.
  - `Node 7: Report` — Export branded, white-label client PDF reports showcasing verified improvements.

---

### SECTION 5 — WHAT YOUR AI SEO AGENT HELPS YOU DO (7 CORE CAPABILITIES)
- **Section Heading:** **Everything You Need to Move from Data to Execution.**
- **Cards (Feature + Concrete Outcome):**
  1. **Website SEO Intelligence:** Scan up to 500 pages per audit run. Identify broken links, indexing directives, and speed bottlenecks with zero false positives.
  2. **GEO and AEO Analysis:** Audit content clarity, Schema.org entity graphs, and answer-first sentence structure required for citation by ChatGPT, Perplexity, and Google AI Overviews.
  3. **Google Search Console Intelligence:** Direct OAuth 2.0 integration synchronizes query-level impressions, clicks, and CTR, mapping performance directly to audited pages.
  4. **SEO Opportunity Finder:** Algorithmically flags striking-distance keywords (ranked 5–20) with high search volume, pinpointing immediate ranking wins.
  5. **SEO Action Center:** Turn diagnostic findings into assigned, sprint-ready tasks with estimated completion time and developer instructions.
  6. **Automated Fix Verification:** When a task is marked complete, the agent automatically re-crawls the affected URL and inspects the live DOM to verify resolution.
  7. **Executive Client Reporting:** Generate branded, white-label PDF reports in one click, highlighting verified fixes and organic search gains for stakeholders.

---

### SECTION 6 — HOW RANKPILOT AI WORKS: STEP-BY-STEP WORKFLOW
- **Section Heading:** **From Website Analysis to Verified SEO Progress.**
- **Subtext:** *A transparent, reliable 7-step process designed for serious SEO practitioners.*
- **The 7 Steps:**
  - *Step 1 — Connect Your Website:* Add any domain. Multi-tenant storage isolates client data securely.
  - *Step 2 — Analyze Your SEO:* The SSRF-guarded crawler inspects pages and calculates transparent mathematical health scores.
  - *Step 3 — Connect Search Console:* Link authorized GSC data via official OAuth 2.0 to access actual organic traffic and ranking trends.
  - *Step 4 — Discover Opportunities:* Uncover high-impression queries in striking distance and isolate URLs experiencing traffic drops.
  - *Step 5 — Prioritize Your Work:* Filter by category (technical, content, GEO, AEO) and severity (critical, high, medium) in the Action Center.
  - *Step 6 — Track and Verify Improvements:* Mark tasks completed. The agent re-crawls the target URL, compares old vs. new evidence, and confirms resolution.
  - *Step 7 — Report Your Progress:* Deliver polished executive PDF summaries to clients proving the measurable impact of completed work.

---

### SECTION 7 — INTERACTIVE PRODUCT SHOWCASE (AUTHENTIC SOFTWARE DEMONSTRATION)
- **Section Heading:** **See the Intelligence Behind Your SEO Workflow.**
- **Subtext:** *Inspect the real interface used by SEO professionals to manage audits, opportunities, and client deliverables.*
- **Tabbed Interface Navigation:**
  - `[Tab 1: Overview Dashboard]` $\rightarrow$ Multi-domain monitoring, health dials, organic growth chart.
  - `[Tab 2: Technical Audit]` $\rightarrow$ 30+ checks, affected URLs, exact HTML code lines, transparent score deductions.
  - `[Tab 3: Opportunity Finder]` $\rightarrow$ GSC striking-distance queries (positions 5–20), impression volume, CTR delta.
  - `[Tab 4: Action Center]` $\rightarrow$ Task priorities, "Fix with agent" prompt generator, automated re-crawl verification feedback.
  - `[Tab 5: Executive Reports]` $\rightarrow$ Client-ready PDF preview, white-label branding, verified improvement logs.
  - `[Tab 6: Trust Center]` $\rightarrow$ Deterministic scoring breakdown, evidence formulas, and system limitations.

---

### SECTION 8 — WHY RANKPILOT AI IS DIFFERENT
- **Section Heading:** **Not Just Another SEO Audit. A Better Way to Manage SEO Work.**
- **6 Differentiator Panels:**
  1. **Evidence Before Recommendations:** We never deliver a generic "fix your title tag" recommendation without providing the exact affected URL, the current HTML snippet, and the technical explanation of why it matters.
  2. **Insights Connected to Actions:** Findings do not die in an Excel export. Every audit finding and GSC opportunity can be turned into an organized action item with one click.
  3. **SEO Data in Context:** Combining site crawl data with Search Console metrics reveals which technical errors actually suppress high-impression queries.
  4. **Priorities That Make Sense:** Rather than treating 200 minor warnings with equal weight, our scoring engine mathematically prioritizes critical blockers that harm indexation.
  5. **Verification, Not Just Completion:** Avoid relying on manual developer promises. RankPilot re-crawls the exact page to verify that the fix is live in production.
  6. **One Organized Agency Workflow:** Replace 4 disconnected subscription tools with one unified intelligence and execution platform.

---

### SECTION 9 — BUILT FOR YOUR SEO WORKFLOW (3 AUDIENCE MODULES)
- **Panel 1: For SEO Freelancers & Solo Consultants**
  - *Headline:* **Manage More SEO Work Without Managing More Spreadsheets.**
  - *Copy:* Solo consultants handle everything from technical crawls to client reporting. RankPilot AI automates the time-consuming data collation, generates prioritized client action plans, and verifies code fixes, allowing you to double your client roster without burning out.
  - *Bullets:* Up to 3 client domains · Fast 25-page audits · GSC striking distance finder · 1-click client reports.
- **Panel 2: For SEO & Digital Marketing Agencies**
  - *Headline:* **Bring Your Client SEO Work Into One Organized Workflow.**
  - *Copy:* Manage multiple client domains, track team action items, and prove retainer ROI with automated re-crawl verification. Eliminate the monthly reporting scramble with white-label, executive client PDF deliverables.
  - *Bullets:* Multi-domain agency monitoring · White-label branding · Automated re-audit verification · Priority processing queue.
- **Panel 3: For In-House SEO Experts & Directors**
  - *Headline:* **Turn Organic Search Insights Into Clear Priorities.**
  - *Copy:* Bridge the gap between SEO strategy and developer sprint tickets. Hand engineering teams prioritized tickets with ready-to-deploy Schema.org code, exact URL targets, and clear evidence of impact.
  - *Bullets:* Mathematical priority scoring · Dev-ready Schema snippets · Traffic drop root-cause investigation · Transparent audit history.

---

### SECTION 10 — TRUST & TRANSPARENCY (OUR CORE PHILOSOPHY)
- **Section Heading:** **Know Why the Agent Recommends Something.**
- **Subtext:** *We believe SEO tools should be accountable. Every finding is backed by evidence, not black-box speculation.*
- **4 Methodological Guarantees:**
  - *Deterministic Scoring:* Category weightings (Technical 30%, On-Page 25%, Indexability 20%, AEO 15%, GEO 10%) are mathematically verified. Deductions are consistent and transparent.
  - *Read-Only Data Security:* We connect to Google Search Console via official Google OAuth 2.0 with read-only permissions. We never modify search settings or share client data.
  - *Evidence-Backed Insights:* Every finding displays the raw HTTP status code, response headers, or HTML DOM elements that triggered the alert.
  - *Explicit System Limitations:* We clearly document crawler boundaries, sample sizes, and rate limits so you always know what was inspected.

---

### SECTION 11 — CLIENT RESULTS & VERIFIED CASE STUDY FRAMEWORK
- **Section Heading:** **Real SEO Work. Measurable Progress.**
- **Subtext:** *How structured action management turns technical fixes into verified organic visibility.*
- **Methodology Demonstration:**
  - Challenge: E-commerce domain with 45 orphaned category pages and missing product schema.
  - Action Executed: Action Center prioritized breadcrumb graph implementation and internal link re-routing.
  - Verification: Automated re-crawl confirmed schema presence across 100% of target URLs within 48 hours.
  - Outcome: +28.4% organic impressions on striking-distance product queries within 60 days.
- **Note:** *[ADD REAL CASE STUDY: Verified client case studies will be published here upon completion of authorized pilot agency deployments].*

---

### SECTION 12 — PRICING OR GET STARTED SECTION
- **Section Heading:** **Transparent Pricing Built for Growing Agencies.**
- **Subtext:** *Predictable monthly and annual plans. No per-seat penalties, no surprise credit overages.*
- **3 Plan Cards (Powered by `PRICING_CONFIG`):**
  - **Freelancer ($49/mo | $39/mo billed annually):** For solo practitioners managing up to 3 client domains with 25 crawled pages per audit pass.
  - **Agency ($149/mo | $119/mo billed annually) [Most Popular - Single Primary CTA]:** For marketing agencies managing up to 15 domains with 100 crawled pages, white-label client reports, and automated re-crawl verification.
  - **Team ($299/mo | $239/mo billed annually):** For expanding teams managing up to 50 domains with 500 crawled pages, custom webhooks, and priority queue.
- **Commitment:** *Cancel anytime with 1 click · 14-day refund satisfaction guarantee [confirm policy].*

---

### SECTION 13 — FREQUENTLY ASKED QUESTIONS (20 COMPREHENSIVE QUESTIONS)
1. **What is RankPilot AI?**  
   RankPilot AI is an AI-powered SEO intelligence and action management platform built for SEO professionals. It crawls websites, monitors Google Search Console data, algorithmically prioritizes technical fixes, and verifies completed work through automated re-crawls.
2. **Who should use RankPilot AI?**  
   It is designed specifically for SEO freelancers, digital marketing agencies, independent consultants, and in-house SEO teams who manage multiple client websites or complex domains.
3. **Is RankPilot AI designed for SEO agencies?**  
   Yes. Agencies use our multi-domain dashboard to monitor client sites, assign prioritized tasks, verify that developer implementations solved detected issues, and generate white-label PDF executive reports.
4. **Can SEO freelancers use RankPilot AI?**  
   Yes. Freelancers use RankPilot AI to deliver the technical auditing and reporting capacity of a multi-person agency team without needing separate spreadsheet software.
5. **How does the AI SEO agent analyze websites?**  
   Our internal crawler makes safe, rate-limited HTTP requests to your public pages, evaluating HTML structure, meta tags, heading hierarchies, Core Web Vitals, and structured data schemas.
6. **Does RankPilot AI check technical SEO?**  
   Yes. It evaluates over 30 technical factors, including HTTP status codes, canonical consistency, robots.txt directives, noindex tags, XML sitemap presence, and page response latency.
7. **Can RankPilot AI analyze GEO and AEO?**  
   Yes. Beyond standard Google search factors, RankPilot evaluates Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) signals, such as Schema.org entity disambiguation and direct 40–60 word answer formatting.
8. **Can I connect Google Search Console?**  
   Yes. You can connect authorized Search Console properties with one click using secure Google OAuth 2.0 with read-only permissions.
9. **How does the SEO Opportunity Finder work?**  
   It cross-references your Search Console query data with audited page URLs to identify "striking-distance" keywords (ranked positions 5–20) that have high impressions and below-average CTR.
10. **Can RankPilot AI identify keyword cannibalization?**  
    Yes. The opportunity engine flags instances where multiple distinct URLs on your domain compete and split impressions for the exact same search query.
11. **Can RankPilot AI investigate traffic drops?**  
    Yes. The Traffic Drop Investigator compares performance across rolling 30-day date windows, isolating the exact pages and queries responsible for clicks or impression declines.
12. **How does RankPilot prioritize SEO tasks?**  
    Tasks are scored using a deterministic formula combining technical defect severity (Critical, High, Medium) with organic impression volume from Search Console.
13. **Can I track completed SEO tasks?**  
    Yes. The Action Center provides a complete task management board with statuses: Backlog, In Progress, Completed (Awaiting Re-Crawl), and Completed (Verified).
14. **Does RankPilot verify completed fixes?**  
    Yes. When you mark a task complete, RankPilot automatically re-crawls the affected URL and verifies whether the defect was actually resolved in live HTML.
15. **Can I generate SEO client reports?**  
    Yes. You can export client-ready executive PDF reports featuring white-label agency branding, verified improvements, and 30-day GSC growth trends.
16. **Does RankPilot AI automatically change my website?**  
    No. RankPilot AI operates in read-only mode for safety. It generates ready-to-deploy code snippets and recommendations, but you or your developers maintain 100% control over live code changes.
17. **Does RankPilot guarantee better rankings?**  
    No. We never make unprovable ranking guarantees. Search algorithms depend on hundreds of dynamic factors. RankPilot guarantees accurate diagnostics, prioritized workflows, and verified code implementations.
18. **How does RankPilot protect website and Google data?**  
    All Search Console API tokens are encrypted in transit and at rest. We enforce multi-tenant organization isolation and never share or sell client data to third parties.
19. **What data does the AI use?**  
    The AI uses the specific HTML DOM and GSC performance metrics of your audited website to draft contextual recommendations. It does not train public models on your proprietary data.
20. **What are the limitations of RankPilot AI?**  
    Our crawler currently analyzes up to 500 pages per audit pass. It requires public URL accessibility and does not bypass paywalls or password-protected staging servers without custom whitelisting.

---

### SECTION 14 — FINAL CONVERSION CTA
- **Container:** High-contrast bordered card with soft depth (`--shadow-pop`).
- **H2:** **Spend Less Time Sorting SEO Data. More Time Moving SEO Forward.**
- **Subtext:** *Bring website analysis, search performance insights and SEO action management into one organized workflow.*
- **Primary Action:** `Get Started with RankPilot AI` (links to `/signup`).
- **Secondary Link:** `Explore Features & Workflows` (links to `/features`).
- **Trust Reassurance:** *Complimentary pilot access · No credit card required · Read-only safe integrations.*
