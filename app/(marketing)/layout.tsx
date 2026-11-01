import React from 'react';
import MarketingNav from '@/components/marketing-nav';
import MarketingFooter from '@/components/marketing-footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text transition-colors">
      <MarketingNav />
      <main id="main-content" className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
