// RankPilot AI - Master Pricing & Subscription Configuration
// Conforms to Master Product Development Prompt (Free, Freelancer, Agency, Team)

export type PlanId = 'free' | 'freelancer' | 'agency' | 'team';

export interface PricingTier {
  id: PlanId;
  name: string;
  badge?: string;
  popular?: boolean;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number; // 10 months pricing (save 2 months)
  annualMonthlyEquivalent: number; // e.g. $390 / 12 = $32.50
  annualSavings: number; // Dollar amount saved per year
  features: string[];
  ctaText: string;
  ctaHref: string;
  primaryCta?: boolean;
  limits: {
    maxWebsites: number;
    maxCrawledPages: number;
    maxSavedReports: number;
    historyRetentionDays: number;
  };
}

export interface FeatureComparisonRow {
  feature: string;
  category: 'Crawl & Audit' | 'Keywords & Intelligence' | 'Action & Reports' | 'Agency & Team';
  free: string | boolean;
  freelancer: string | boolean;
  agency: string | boolean;
  team: string | boolean;
}

export const PLAN_LIMITS_MAP: Record<PlanId, {
  maxWebsites: number;
  maxCrawledPages: number;
  maxSavedReports: number;
  historyRetentionDays: number;
  hasGscSync: boolean;
  hasStrikingDistance: boolean;
  hasTrafficDropEngine: boolean;
  hasKeywordClustering: boolean;
  hasTeamSeats: boolean;
  hasApiAccess: boolean;
  hasWhiteLabelReports: boolean;
}> = {
  free: {
    maxWebsites: 1,
    maxCrawledPages: 10,
    maxSavedReports: 3,
    historyRetentionDays: 14,
    hasGscSync: false,
    hasStrikingDistance: false,
    hasTrafficDropEngine: false,
    hasKeywordClustering: false,
    hasTeamSeats: false,
    hasApiAccess: false,
    hasWhiteLabelReports: false,
  },
  freelancer: {
    maxWebsites: 3,
    maxCrawledPages: 25,
    maxSavedReports: 25,
    historyRetentionDays: 90,
    hasGscSync: true,
    hasStrikingDistance: false,
    hasTrafficDropEngine: false,
    hasKeywordClustering: false,
    hasTeamSeats: false,
    hasApiAccess: false,
    hasWhiteLabelReports: false,
  },
  agency: {
    maxWebsites: 15,
    maxCrawledPages: 100,
    maxSavedReports: 100,
    historyRetentionDays: 365,
    hasGscSync: true,
    hasStrikingDistance: true,
    hasTrafficDropEngine: true,
    hasKeywordClustering: false,
    hasTeamSeats: true,
    hasApiAccess: false,
    hasWhiteLabelReports: true,
  },
  team: {
    maxWebsites: 50,
    maxCrawledPages: 500,
    maxSavedReports: 500,
    historyRetentionDays: 3650, // unlimited (10 yrs)
    hasGscSync: true,
    hasStrikingDistance: true,
    hasTrafficDropEngine: true,
    hasKeywordClustering: true,
    hasTeamSeats: true,
    hasApiAccess: true,
    hasWhiteLabelReports: true,
  },
};

export const PRICING_CONFIG: {
  lastUpdated: string;
  annualDiscountPercentage: number;
  tiers: PricingTier[];
  comparisonRows: FeatureComparisonRow[];
} = {
  lastUpdated: 'November 2, 2026',
  annualDiscountPercentage: 17, // 10 months for 12 months (~16.7%)
  tiers: [
    {
      id: 'free',
      name: 'Free',
      tagline: 'For individual SEOs testing and auditing single sites.',
      monthlyPrice: 0,
      annualPrice: 0,
      annualMonthlyEquivalent: 0,
      annualSavings: 0,
      features: [
        '1 Monitored Website',
        '10 Crawled Pages per Audit Run',
        '3 Saved Audit Reports',
        'Basic SEO, GEO & AEO Health Scores',
        'Core Technical Issue Findings',
        'Manual Audit Execution',
        'Basic Account Support',
      ],
      ctaText: 'Start Free Plan',
      ctaHref: '/signup?plan=free',
      primaryCta: false,
      limits: {
        maxWebsites: 1,
        maxCrawledPages: 10,
        maxSavedReports: 3,
        historyRetentionDays: 14,
      },
    },
    {
      id: 'freelancer',
      name: 'Freelancer',
      tagline: 'For independent SEO consultants and solo practitioners.',
      monthlyPrice: 39,
      annualPrice: 390,
      annualMonthlyEquivalent: 32.5,
      annualSavings: 78,
      features: [
        'Up to 3 Monitored Websites',
        '25 Crawled Pages per Audit Run',
        'Full SEO, GEO & AEO Health Suite',
        '90-Day Audit History Retention',
        'Google Search Console OAuth Sync',
        'Action Center & Task Verification',
        'Basic SEO Opportunity Discovery',
        'Standard Client PDF Reports',
      ],
      ctaText: 'Start Freelancer Plan',
      ctaHref: '/signup?plan=freelancer',
      primaryCta: false,
      limits: {
        maxWebsites: 3,
        maxCrawledPages: 25,
        maxSavedReports: 25,
        historyRetentionDays: 90,
      },
    },
    {
      id: 'agency',
      name: 'Agency',
      popular: true,
      badge: 'Most Popular',
      tagline: 'For digital agencies managing several client campaigns.',
      monthlyPrice: 99,
      annualPrice: 990,
      annualMonthlyEquivalent: 82.5,
      annualSavings: 198,
      features: [
        'Up to 15 Monitored Websites',
        '100 Crawled Pages per Audit Run',
        '12-Month Audit History Retention',
        'GSC Striking Distance Opportunity Finder',
        'Traffic Drop Investigation Engine',
        'Automated Re-Crawl Task Verification',
        'White-Label Branded Executive Reports',
        'Cross-Website Overview & Multi-Client Flow',
      ],
      ctaText: 'Start Agency Plan',
      ctaHref: '/signup?plan=agency',
      primaryCta: true, // Distinct primary highlight
      limits: {
        maxWebsites: 15,
        maxCrawledPages: 100,
        maxSavedReports: 100,
        historyRetentionDays: 365,
      },
    },
    {
      id: 'team',
      name: 'Team',
      tagline: 'For high-volume SEO teams and growing enterprise agencies.',
      monthlyPrice: 149,
      annualPrice: 1490,
      annualMonthlyEquivalent: 124.16,
      annualSavings: 298,
      features: [
        'Up to 50 Monitored Websites',
        '500 Crawled Pages per Audit Run',
        'Unlimited Audit History (Fair Use)',
        'Full Keyword Clustering & Intent Mapping',
        'Team Collaboration & Role Permissions',
        'Shared Task Management & Activity Log',
        'Custom Webhooks & Direct API Access',
        'Priority Processing Queue & Support',
      ],
      ctaText: 'Start Team Plan',
      ctaHref: '/signup?plan=team',
      primaryCta: false,
      limits: {
        maxWebsites: 50,
        maxCrawledPages: 500,
        maxSavedReports: 500,
        historyRetentionDays: 3650,
      },
    },
  ],
  comparisonRows: [
    // Crawl & Audit
    { feature: 'Monitored Websites', category: 'Crawl & Audit', free: '1 Site', freelancer: '3 Sites', agency: '15 Sites', team: '50 Sites' },
    { feature: 'Crawled Pages per Audit', category: 'Crawl & Audit', free: '10 Pages', freelancer: '25 Pages', agency: '100 Pages', team: '500 Pages' },
    { feature: 'Audit History Retention', category: 'Crawl & Audit', free: '3 Saved', freelancer: '90 Days', agency: '12 Months', team: 'Unlimited' },
    { feature: 'SEO Health Scoring', category: 'Crawl & Audit', free: 'Basic', freelancer: 'Full Suite', agency: 'Full Suite', team: 'Full Suite' },
    { feature: 'GEO (Generative Engine) Scoring', category: 'Crawl & Audit', free: 'Basic', freelancer: true, agency: true, team: true },
    { feature: 'AEO (Answer Engine) Schema Checks', category: 'Crawl & Audit', free: 'Basic', freelancer: true, agency: true, team: true },
    { feature: 'SSRF-Safe Crawler Protection', category: 'Crawl & Audit', free: true, freelancer: true, agency: true, team: true },

    // Keywords & Intelligence
    { feature: 'Google Search Console Sync', category: 'Keywords & Intelligence', free: false, freelancer: true, agency: true, team: true },
    { feature: 'GSC Striking Distance Finder (Pos 11-20)', category: 'Keywords & Intelligence', free: false, freelancer: false, agency: true, team: true },
    { feature: 'Traffic Drop Investigation Engine', category: 'Keywords & Intelligence', free: false, freelancer: false, agency: true, team: true },
    { feature: 'Keyword Clustering & Intent Mapping', category: 'Keywords & Intelligence', free: false, freelancer: false, agency: false, team: true },

    // Action & Reports
    { feature: 'SEO Action Center & Tasks', category: 'Action & Reports', free: 'Basic View', freelancer: true, agency: true, team: true },
    { feature: 'Automated Re-Crawl Task Verification', category: 'Action & Reports', free: false, freelancer: true, agency: true, team: true },
    { feature: 'PDF Client Reports', category: 'Action & Reports', free: false, freelancer: 'Standard', agency: 'White-Label Branded', team: 'White-Label Branded' },
    { feature: 'Export Formats (PDF, CSV, JSON)', category: 'Action & Reports', free: 'JSON Only', freelancer: 'PDF, CSV', agency: 'PDF, CSV, JSON', team: 'PDF, CSV, JSON' },

    // Agency & Team
    { feature: 'Team Member Seats', category: 'Agency & Team', free: '1 Seat', freelancer: '1 Seat', agency: 'Up to 5 Seats', team: 'Unlimited Seats' },
    { feature: 'Role-Based Access Control', category: 'Agency & Team', free: false, freelancer: false, agency: true, team: true },
    { feature: 'Custom Webhooks & API Access', category: 'Agency & Team', free: false, freelancer: false, agency: false, team: true },
    { feature: 'Support Level', category: 'Agency & Team', free: 'Community', freelancer: 'Standard Email', agency: 'Priority Email', team: 'Dedicated Account Support' },
  ],
};
