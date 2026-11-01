export interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  popular?: boolean;
  tagline: string;
  monthlyPrice: number;
  annualMonthlyPrice: number; // e.g. 20% discount
  features: string[];
  ctaText: string;
  ctaHref: string;
  primaryCta?: boolean;
}

export interface FeatureComparisonRow {
  feature: string;
  category: 'Crawl & Audit' | 'Keywords & Intelligence' | 'Action & Reports' | 'Agency & Support';
  freelancer: string | boolean;
  agency: string | boolean;
  team: string | boolean;
}

export const PRICING_CONFIG: {
  lastUpdated: string;
  annualDiscountPercentage: number;
  tiers: PricingTier[];
  comparisonRows: FeatureComparisonRow[];
} = {
  lastUpdated: 'November 1, 2026',
  annualDiscountPercentage: 20,
  tiers: [
    {
      id: 'freelancer',
      name: 'Freelancer',
      tagline: 'For independent SEO consultants and solo practitioners.',
      monthlyPrice: 49,
      annualMonthlyPrice: 39,
      features: [
        'Up to 3 Monitored Websites',
        '25 Crawled Pages per Audit Run',
        'SEO, GEO & AEO Health Scores',
        'Search Console OAuth Sync',
        'Action Center & Task Verification',
        'Standard PDF Client Reports',
        'Community & Email Support',
      ],
      ctaText: 'Start Freelancer Plan',
      ctaHref: '/signup?plan=freelancer',
      primaryCta: false,
    },
    {
      id: 'agency',
      name: 'Agency',
      popular: true,
      badge: 'Most Popular',
      tagline: 'For digital agencies managing multiple client campaigns.',
      monthlyPrice: 149,
      annualMonthlyPrice: 119,
      features: [
        'Up to 15 Monitored Websites',
        '100 Crawled Pages per Audit Run',
        'Full SEO, GEO & AEO Health Suite',
        'GSC Striking Distance Opportunity Finder',
        'Traffic Drop Investigation Engine',
        'Automated Re-Crawl Task Verification',
        'White-Label Branded Executive Reports',
        'Priority Agent Processing Queue',
      ],
      ctaText: 'Start Agency Plan',
      ctaHref: '/signup?plan=agency',
      primaryCta: true, // Single primary button on screen
    },
    {
      id: 'team',
      name: 'Team',
      tagline: 'For expanding teams and agencies requiring high crawl volume.',
      monthlyPrice: 299,
      annualMonthlyPrice: 239,
      features: [
        'Up to 50 Monitored Websites',
        '500 Crawled Pages per Audit Run',
        'Unlimited Audit History & Trend Tracking',
        'Full Keyword Clustering & SERP Tracking',
        'Custom Webhook & API Access [confirm]',
        'Unlimited Team Member Seats',
        'Dedicated Technical Account Manager',
      ],
      ctaText: 'Start Team Plan',
      ctaHref: '/signup?plan=team',
      primaryCta: false,
    },
  ],
  comparisonRows: [
    // Crawl & Audit
    { feature: 'Monitored Websites', category: 'Crawl & Audit', freelancer: '3 Sites', agency: '15 Sites', team: '50 Sites' },
    { feature: 'Crawled Pages per Audit', category: 'Crawl & Audit', freelancer: '25 Pages', agency: '100 Pages', team: '500 Pages' },
    { feature: 'SSRF-Safe Crawler Protection', category: 'Crawl & Audit', freelancer: true, agency: true, team: true },
    { feature: 'AEO (Answer Engine) Schema Checks', category: 'Crawl & Audit', freelancer: true, agency: true, team: true },
    { feature: 'GEO (Generative Engine) Scoring', category: 'Crawl & Audit', freelancer: true, agency: true, team: true },

    // Keywords & Intelligence
    { feature: 'Google Search Console Direct Sync', category: 'Keywords & Intelligence', freelancer: true, agency: true, team: true },
    { feature: 'Striking Distance Opportunity Finder', category: 'Keywords & Intelligence', freelancer: 'Basic', agency: 'Full Engine', team: 'Full Engine' },
    { feature: 'Traffic Drop Root-Cause Analysis', category: 'Keywords & Intelligence', freelancer: false, agency: true, team: true },
    { feature: 'Keyword Rank Position Tracking', category: 'Keywords & Intelligence', freelancer: true, agency: true, team: true },

    // Action & Reports
    { feature: 'Prioritized Action Center', category: 'Action & Reports', freelancer: true, agency: true, team: true },
    { feature: 'Automated Re-Audit Verification', category: 'Action & Reports', freelancer: 'Manual Re-Check', agency: 'Automated', team: 'Automated + Webhooks' },
    { feature: 'Executive Client PDF Reports', category: 'Action & Reports', freelancer: 'Standard', agency: 'White-Label', team: 'White-Label Custom' },

    // Agency & Support
    { feature: 'Team Seats', category: 'Agency & Support', freelancer: '1 Seat', agency: '5 Seats', team: 'Unlimited' },
    { feature: 'Support Level', category: 'Agency & Support', freelancer: 'Standard Email', agency: 'Priority Support', team: 'Dedicated Manager' },
  ],
};
