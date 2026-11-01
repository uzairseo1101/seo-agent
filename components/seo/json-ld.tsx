import React from 'react';

export function SiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://rankpilot.ai/#organization',
        name: 'RankPilot AI',
        url: 'https://rankpilot.ai',
        logo: 'https://rankpilot.ai/logo.png',
        description: 'RankPilot AI is an AI SEO agent that audits websites, discovers striking-distance keyword opportunities, and verifies technical fixes automatically.',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@rankpilot.ai',
          contactType: 'customer support',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://rankpilot.ai/#website',
        url: 'https://rankpilot.ai',
        name: 'RankPilot AI',
        publisher: {
          '@id': 'https://rankpilot.ai/#organization',
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://rankpilot.ai/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareAppJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'RankPilot AI',
    operatingSystem: 'All (Web-based SaaS)',
    applicationCategory: 'BusinessApplication',
    offers: [
      {
        '@type': 'Offer',
        price: '49.00',
        priceCurrency: 'USD',
        name: 'Freelancer Plan',
      },
      {
        '@type': 'Offer',
        price: '149.00',
        priceCurrency: 'USD',
        name: 'Agency Plan',
      },
      {
        '@type': 'Offer',
        price: '299.00',
        priceCurrency: 'USD',
        name: 'Team Plan',
      },
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '48',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FaqJsonLd({ faqs }: { faqs: { q: string; a: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbsJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function HowToJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Automate SEO Audits and Action Verification with an AI Agent',
    description: 'A 4-step workflow to audit websites, uncover keyword opportunities, and verify technical SEO fixes with RankPilot AI.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Connect your website',
        text: 'Add your domain URL and link Google Search Console via read-only OAuth.',
        url: 'https://rankpilot.ai/how-it-works#step-1',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Ask the agent',
        text: 'Give your objective in plain English, such as "Audit example.com and list top fixes".',
        url: 'https://rankpilot.ai/how-it-works#step-2',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Watch autonomous execution',
        text: 'Follow the live timeline as the agent inspects speed, links, and schemas.',
        url: 'https://rankpilot.ai/how-it-works#step-3',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Review, fix and verify',
        text: 'Approve suggested fixes, verify resolution with automated re-crawls, and export client reports.',
        url: 'https://rankpilot.ai/how-it-works#step-4',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
