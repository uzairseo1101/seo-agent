'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { Website } from '@/lib/types';
import { generateClientReportData, FullClientReportData } from '@/lib/reports/report-generator';
import {
  FileText,
  Printer,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Target
} from 'lucide-react';

export default function ReportsPage() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const org = storage.getOrganization();
  const [selectedWebId, setSelectedWebId] = useState(websites[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  React.useEffect(() => {
    let mounted = true;
    const fetchSites = async () => {
      try {
        const res = await fetch('/api/websites');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.websites) && mounted) {
            const clean = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
            );
            setWebsites(clean);
            if (!selectedWebId && clean.length > 0) {
              setSelectedWebId(clean[0].id);
            }
          }
        }
      } catch (e) {
        // Fallback
      }
    };
    fetchSites();
    return () => {
      mounted = false;
    };
  }, [selectedWebId]);

  const [report, setReport] = useState<FullClientReportData>(
    generateClientReportData(selectedWebId, startDate, endDate)
  );

  const handleGenerateReport = () => {
    const updated = generateClientReportData(selectedWebId, startDate, endDate);
    setReport(updated);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Agency Client Reporting"
        subtitle="Produce transparent, executive-ready SEO, GEO & AEO visibility reports backed by verified database evidence"
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Controls Bar (Hidden during print) */}
        <div className="bg-card p-4 rounded-lg border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="text-[10px] font-semibold uppercase text-muted block mb-1">Website</label>
              <select
                value={selectedWebId}
                onChange={(e) => setSelectedWebId(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.domain})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-muted block mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold uppercase text-muted block mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
              />
            </div>

            <button
              onClick={handleGenerateReport}
              className="mt-5 px-4 h-10 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-medium shadow-xs transition-colors"
            >
              Update Report
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="mt-5 sm:mt-0 inline-flex items-center gap-1.5 px-4 h-10 border border-border bg-card hover:bg-slate-50 text-text rounded-md text-xs font-medium shadow-xs transition-colors self-start sm:self-auto"
          >
            <Printer className="w-3.5 h-3.5 text-muted" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Printable Agency Report Container */}
        <div className="bg-card rounded-lg border border-border p-8 sm:p-10 shadow-card space-y-8 print:shadow-none print:border-none print:p-0">
          {/* Report Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <span className="text-xs font-mono font-medium uppercase text-primary tracking-wider">
                RankPilot AI • Executive Performance Report
              </span>
              <h2 className="text-2xl font-bold font-head text-text mt-1">
                {report.website.name}
              </h2>
              <p className="text-xs text-muted font-mono mt-0.5">
                Target Domain: {report.website.domain} • Period: {report.period.start} to {report.period.end}
              </p>
            </div>
            <div className="text-left sm:text-right font-mono text-xs">
              <span className="text-muted block text-[10px]">Generated For</span>
              <strong className="text-text font-bold">{org.name}</strong>
              <span className="text-[10px] text-muted block mt-0.5">
                Report Date: {new Date(report.generatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Scores Overview Row */}
          <div>
            <h3 className="text-sm font-bold font-head text-text uppercase tracking-wider mb-3">
              1. Performance Health & Visibility Scores
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-md bg-bg border border-border">
                <span className="text-xs font-medium text-muted block">Technical SEO Health</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-text tnum">{report.scores.seoScore}</span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Evaluated across 30+ core technical rules
                </p>
              </div>

              <div className="p-5 rounded-md bg-bg border border-border">
                <span className="text-xs font-medium text-muted block">GEO Authority Score</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-text tnum">{report.scores.geoScore}</span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Brand entity schemas & author citation transparency
                </p>
              </div>

              <div className="p-5 rounded-md bg-bg border border-border">
                <span className="text-xs font-medium text-muted block">AEO Answer Readiness</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-text tnum">{report.scores.aeoScore}</span>
                  <span className="text-xs text-muted">/ 100</span>
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Conversational Q&A density & snippet readiness
                </p>
              </div>
            </div>
          </div>

          {/* Verified Improvements Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold font-head text-text uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                2. Verified Implementation Work ({report.verifiedImprovements.length})
              </h3>
              <span className="text-xs font-mono font-medium text-primary bg-primary-tint border border-emerald-200 px-2 py-0.5 rounded-full">
                Independent Re-Crawl Confirmed
              </span>
            </div>

            <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
              {report.verifiedImprovements.map((item) => (
                <div key={item.id} className="p-4 bg-card space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-text">{item.title}</span>
                    <span className="font-mono text-primary font-bold">✓ Verified</span>
                  </div>
                  <p className="text-muted leading-relaxed">{item.description}</p>
                  <p className="font-mono text-[11px] text-muted">URL: {item.affectedUrl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search Console Performance Section */}
          <div>
            <h3 className="text-sm font-bold font-head text-text uppercase tracking-wider mb-3">
              3. Google Search Console 28-Day Performance
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-bg rounded-md border border-border">
                <span className="text-muted block text-[10px] uppercase font-sans">Total Clicks</span>
                <span className="text-base font-bold text-text tnum">{report.searchConsole.totalClicks.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-bg rounded-md border border-border">
                <span className="text-muted block text-[10px] uppercase font-sans">Total Impressions</span>
                <span className="text-base font-bold text-text tnum">{report.searchConsole.totalImpressions.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-bg rounded-md border border-border">
                <span className="text-muted block text-[10px] uppercase font-sans">Average CTR</span>
                <span className="text-base font-bold text-text tnum">{report.searchConsole.avgCtr}%</span>
              </div>
              <div className="p-3 bg-bg rounded-md border border-border">
                <span className="text-muted block text-[10px] uppercase font-sans">Average Position</span>
                <span className="text-base font-bold text-text tnum">{report.searchConsole.avgPosition}</span>
              </div>
            </div>
          </div>

          {/* Methodology Disclosure Statement */}
          <div className="p-4 rounded-md bg-bg border border-border text-xs space-y-1 text-muted">
            <div className="flex items-center gap-1.5 font-semibold text-text">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Evidence-Backed Verification Statement:</span>
            </div>
            <p className="leading-relaxed pl-5 font-sans">
              {report.methodologyStatement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
