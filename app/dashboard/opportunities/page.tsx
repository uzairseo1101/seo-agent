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
  Layers,
  Bot
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
    <div className="space-y-6">
      <DashboardHeader
        title="SEO Opportunity Finder"
        subtitle="Uncover high-impression queries in striking distance (positions 5–20) and low-CTR pages"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Task Added Notice Banner */}
        {taskNotice && (
          <div className="p-3.5 rounded-md bg-primary-tint border border-emerald-200 text-xs text-primary flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{taskNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-medium text-accent hover:underline">
              Open Action Center →
            </Link>
          </div>
        )}

        {/* Filters and Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Types ({opportunities.length})</option>
                <option value="striking_distance_5_20">Striking Distance (Pos 5–20)</option>
                <option value="high_impressions_low_ctr">High Imp / Low CTR</option>
                <option value="declining_ctr">Declining CTR</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Impact:</span>
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Impacts</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-mono text-muted">
            Found <strong className="text-text">{filteredOpportunities.length}</strong> opportunities
          </div>
        </div>

        {/* Opportunities List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOpportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-card rounded-lg border border-border p-6 shadow-card hover:border-slate-300 transition-colors space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    opp.potentialImpact === 'critical' ? 'bg-red-50 text-error border border-red-200' :
                    opp.potentialImpact === 'high' ? 'bg-amber-50 text-warning border border-amber-200' :
                    'bg-blue-50 text-accent border border-blue-200'
                  }`}>
                    {opp.potentialImpact} Impact
                  </span>
                  <span className="text-xs font-mono font-medium text-muted uppercase">
                    {opp.type.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/action-center"
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-accent text-xs font-medium shadow-xs transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-accent" />
                    <span>Fix with agent</span>
                  </Link>

                  <button
                    onClick={() => handleConvertToTask(opp.id)}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-text text-xs font-medium shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Convert to Task</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold font-head text-text flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary shrink-0" />
                  Target Query: &ldquo;{opp.query}&rdquo;
                </h4>
                <p className="text-xs font-mono text-muted mt-1 truncate">
                  Landing Page: {opp.pageUrl}
                </p>
              </div>

              {/* SERP Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 bg-bg rounded-md border border-border">
                  <span className="text-muted block text-[10px] uppercase font-sans">Current Position</span>
                  <span className="text-base font-bold text-text tnum">{opp.position}</span>
                </div>
                <div className="p-3 bg-bg rounded-md border border-border">
                  <span className="text-muted block text-[10px] uppercase font-sans">28d Impressions</span>
                  <span className="text-base font-bold text-text tnum">{opp.impressions.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-bg rounded-md border border-border">
                  <span className="text-muted block text-[10px] uppercase font-sans">28d Clicks</span>
                  <span className="text-base font-bold text-primary tnum">{opp.clicks}</span>
                </div>
                <div className="p-3 bg-bg rounded-md border border-border">
                  <span className="text-muted block text-[10px] uppercase font-sans">CTR</span>
                  <span className="text-base font-bold text-text tnum">{opp.ctr.toFixed(2)}%</span>
                </div>
              </div>

              <div className="p-3.5 rounded-md bg-bg border border-border space-y-1.5 text-xs">
                <div>
                  <strong className="text-text font-head">GSC Evidence & Hypothesis:</strong>{' '}
                  <span className="text-muted leading-relaxed font-sans">{opp.hypothesis}</span>
                </div>
                <div>
                  <strong className="text-text font-head">Recommended Action:</strong>{' '}
                  <span className="text-primary font-medium leading-relaxed font-sans">{opp.recommendedAction}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredOpportunities.length === 0 && (
            <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border shadow-card space-y-3">
              <Sparkles className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-medium text-text">No opportunities match the current filter.</p>
              <button
                onClick={() => { setTypeFilter('all'); setImpactFilter('all'); }}
                className="px-4 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
