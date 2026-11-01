'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { SeoOpportunity } from '@/lib/types';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle2,
  Filter,
  Check,
  Search,
  ExternalLink,
  Layers
} from 'lucide-react';
import Link from 'next/link';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<SeoOpportunity[]>(storage.getOpportunities());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [impactFilter, setImpactFilter] = useState<string>('all');
  const [taskNotice, setTaskNotice] = useState<string | null>(null);

  const handleConvertToTask = (oppId: string) => {
    const newTask = storage.createActionItemFromOpportunity(oppId);
    if (newTask) {
      setTaskNotice(`Action task created: "${newTask.title}"`);
      setTimeout(() => setTaskNotice(null), 3500);
    }
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    if (typeFilter !== 'all' && opp.type !== typeFilter) return false;
    if (impactFilter !== 'all' && opp.potentialImpact !== impactFilter) return false;
    return true;
  });

  return (
    <div>
      <DashboardHeader
        title="SEO Opportunity Finder"
        subtitle="Uncover high-impression queries in striking distance (positions 5–20) and low-CTR pages"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Task Added Notice Banner */}
        {taskNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-semibold text-emerald-900 underline hover:no-underline">
              Open Action Center →
            </Link>
          </div>
        )}

        {/* Filters and Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-muted">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
              >
                <option value="all">All Types ({opportunities.length})</option>
                <option value="striking_distance_5_20">Striking Distance (Pos 5–20)</option>
                <option value="high_impressions_low_ctr">High Imp / Low CTR</option>
                <option value="declining_ctr">Declining CTR</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-muted">Impact:</span>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
              >
                <option value="all">All Impacts</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-surface-muted">
            Found <strong className="text-navy">{filteredOpportunities.length}</strong> opportunities
          </div>
        </div>

        {/* Opportunities List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-xl border border-surface-border p-6 shadow-sm hover:shadow-md transition-shadow space-y-4"
            >
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
                     opp.type === 'high_impressions_low_ctr' ? 'High Impressions / Low CTR' : 'Declining CTR Alert'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <span>Impressions: <strong className="text-navy">{opp.impressions.toLocaleString()}</strong></span>
                  <span>Clicks: <strong className="text-navy">{opp.clicks.toLocaleString()}</strong></span>
                  <span>CTR: <strong className="text-navy">{(opp.ctr * 100).toFixed(2)}%</strong></span>
                  <span>Avg Position: <strong className="text-brand-700">{opp.position}</strong></span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-navy flex items-center gap-2">
                  <Target className="w-4 h-4 text-brand-600 shrink-0" />
                  Target Query: &ldquo;{opp.query}&rdquo;
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-1 truncate">
                  Landing Page: {opp.pageUrl}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-bg border border-surface-border space-y-2 text-xs">
                <div>
                  <strong className="text-navy">GSC Evidence & Hypothesis:</strong>{' '}
                  <span className="text-slate-600 leading-relaxed">{opp.hypothesis}</span>
                </div>
                <div>
                  <strong className="text-navy">Recommended Action:</strong>{' '}
                  <span className="text-brand-700 font-medium leading-relaxed">{opp.recommendedAction}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-surface-border">
                <span className="text-[11px] text-surface-muted">
                  Source: Google Search Console (28-day verified dataset)
                </span>
                <button
                  onClick={() => handleConvertToTask(opp.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Convert to Action Task</span>
                </button>
              </div>
            </div>
          ))}

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-surface-border">
              <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-navy">No opportunities match the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
