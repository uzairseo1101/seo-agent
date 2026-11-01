'use client';

import React from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { Sparkles, ArrowRight, TrendingUp, Target, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
  const opportunities = storage.getOpportunities();

  return (
    <div>
      <DashboardHeader
        title="SEO Opportunity Finder"
        subtitle="Uncover high-impression queries in striking distance (positions 5–20) and low-CTR pages"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-navy">Discovered Organic Opportunities ({opportunities.length})</h2>
            <p className="text-xs text-surface-muted">Based on verified 28-day Search Console impressions and CTR benchmarks</p>
          </div>
          <Link
            href="/dashboard/action-center"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            Manage in Action Center <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {opportunities.map((opp) => (
            <div key={opp.id} className="bg-white rounded-xl border border-surface-border p-6 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                    opp.potentialImpact === 'critical' ? 'bg-red-100 text-red-700' :
                    opp.potentialImpact === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {opp.potentialImpact} Impact
                  </span>
                  <span className="text-xs font-semibold text-surface-muted">
                    {opp.type === 'striking_distance_5_20' ? 'Striking Distance (Pos 5–20)' :
                     opp.type === 'high_impressions_low_ctr' ? 'High Imp / Low CTR' : 'Declining CTR Alert'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span>Impressions: <strong className="text-navy">{opp.impressions.toLocaleString()}</strong></span>
                  <span>Clicks: <strong className="text-navy">{opp.clicks.toLocaleString()}</strong></span>
                  <span>CTR: <strong className="text-navy">{(opp.ctr * 100).toFixed(2)}%</strong></span>
                  <span>Avg Position: <strong className="text-navy">{opp.position}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-navy">Query: &ldquo;{opp.query}&rdquo;</h3>
                <p className="text-xs font-mono text-slate-500 mt-1">Target Page: {opp.pageUrl}</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-2 text-xs">
                <div>
                  <span className="font-bold text-navy">Evidence Hypothesis:</span>{' '}
                  <span className="text-slate-600">{opp.hypothesis}</span>
                </div>
                <div>
                  <span className="font-bold text-navy">Recommended Action:</span>{' '}
                  <span className="text-brand-700 font-medium">{opp.recommendedAction}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-surface-muted">Source: Google Search Console (28-day sync)</span>
                <Link
                  href="/dashboard/action-center"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  Convert to Action Item
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
