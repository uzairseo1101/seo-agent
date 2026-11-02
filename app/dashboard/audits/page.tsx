'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { AuditRun, AuditFinding, FindingCategory, FindingSeverity, Website } from '@/lib/types';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Play,
  ArrowRight,
  Filter,
  Layers,
  ChevronRight,
  Check,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Bot,
  RefreshCw,
  CheckCircle,
  XCircle,
  Globe,
  Plus
} from 'lucide-react';

export default function AuditsPage() {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('rankpilot_active_website_id');
      if (saved) return saved;
    }
    return '';
  });
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Trigger Modal & Progress state
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgressStep, setAuditProgressStep] = useState<string>('');
  const [auditError, setAuditError] = useState<string>('');
  const [taskAddedNotice, setTaskAddedNotice] = useState<string | null>(null);

  // Sync websites on mount
  React.useEffect(() => {
    let mounted = true;
    const fetchWebsites = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch('/api/websites', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.websites) && mounted) {
            const cleanWebsites = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name) &&
                !['saasflow.io', 'nordicclean.com', 'zenithlaw.co.uk'].includes(w.domain)
            );
            setWebsites(cleanWebsites);
            if (cleanWebsites.length > 0) {
              const currentId = selectedWebsiteId || (typeof window !== 'undefined' ? localStorage.getItem('rankpilot_active_website_id') : null);
              if (!currentId || !cleanWebsites.some((w: Website) => w.id === currentId)) {
                const firstId = cleanWebsites[0].id;
                setSelectedWebsiteId(firstId);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('rankpilot_active_website_id', firstId);
                }
              }
            } else {
              setSelectedWebsiteId('');
            }
          }
        }
      } catch (e) {
        // Fallback to storage
      }
    };
    fetchWebsites();
    return () => {
      mounted = false;
    };
  }, [selectedWebsiteId]);

  // Sync audits and findings whenever selectedWebsiteId changes
  React.useEffect(() => {
    let mounted = true;
    if (!selectedWebsiteId) {
      setAuditRuns([]);
      setFindings([]);
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('rankpilot_active_website_id', selectedWebsiteId);
    }

    const fetchAudits = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(`/api/audits?websiteId=${selectedWebsiteId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && mounted) {
            if (Array.isArray(data.auditRuns)) {
              setAuditRuns(data.auditRuns);
            }
            if (Array.isArray(data.findings)) {
              setFindings(data.findings);
            }
          }
        }
      } catch (e) {
        if (mounted) {
          setAuditRuns(storage.getAuditRuns(selectedWebsiteId));
          setFindings(storage.getFindings());
        }
      }
    };

    fetchAudits();
    return () => {
      mounted = false;
    };
  }, [selectedWebsiteId]);

  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId) || websites[0];
  const latestRun = auditRuns[0];

  const handleLaunchAudit = async () => {
    if (!selectedWebsiteId) return;

    setIsAuditing(true);
    setAuditError('');
    setAuditProgressStep('Validating URL against anti-SSRF boundaries...');

    try {
      setTimeout(() => setAuditProgressStep('Fetching robots.txt and sitemap.xml...'), 400);
      setTimeout(() => setAuditProgressStep('Executing controlled sample crawl (Cheerio)...'), 900);
      setTimeout(() => setAuditProgressStep('Running 30+ Technical SEO checks...'), 1400);
      setTimeout(() => setAuditProgressStep('Calculating GEO authority & AEO answer readiness...'), 1900);

      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/audits/run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          websiteId: selectedWebsiteId,
          url: selectedWebsite?.url,
          domain: selectedWebsite?.domain,
          name: selectedWebsite?.name,
          maxPages: 15,
          maxDepth: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Audit execution failed.');
      }

      if (data.auditRun) {
        setAuditRuns(prev => [data.auditRun, ...prev.filter(r => r.id !== data.auditRun.id)]);
      }
      if (Array.isArray(data.findings)) {
        setFindings(data.findings);
        storage.saveAuditRun(data.auditRun, data.findings);
      } else {
        setAuditRuns([...storage.getAuditRuns()]);
        setFindings([...storage.getFindings()]);
      }

      setIsTriggerModalOpen(false);
      setIsAuditing(false);
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed.');
      setIsAuditing(false);
    }
  };

  const handleCreateTask = async (findingId: string) => {
    const finding = findings.find(f => f.id === findingId);
    if (!finding) return;

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: finding.title,
          description: finding.description,
          category: finding.category,
          priority: finding.severity === 'critical' ? 'critical' : (finding.severity === 'high' ? 'high' : 'medium'),
          affectedUrl: finding.url,
          recommendedSolution: finding.recommendation,
          websiteId: selectedWebsiteId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.task) {
          storage.addActionItem(data.task);
          setTaskAddedNotice(`Action Task created: "${data.task.title}"`);
          setTimeout(() => setTaskAddedNotice(null), 3500);
          return;
        }
      }
    } catch {
      // Fallback to client storage
    }

    const newTask = storage.createActionItemFromFinding(findingId);
    if (newTask) {
      setTaskAddedNotice(`Action Task created: "${newTask.title}"`);
      setTimeout(() => setTaskAddedNotice(null), 3500);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="SEO, GEO & AEO Website Audits"
        subtitle="Safe in-house crawls evaluating 30+ technical standards, entity clarity and answer engine readiness"
        actionButton={
          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Audit</span>
          </button>
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {websites.length === 0 ? (
          <div className="bg-card rounded-lg border border-dashed border-border p-12 text-center shadow-card flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold font-head text-text">
                No client websites connected yet
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Before running an automated crawler audit, connect your client domain to set DNS boundaries and safe crawling limits.
              </p>
            </div>
            <Link
              href="/dashboard/websites"
              className="inline-flex items-center gap-1.5 h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Connect Website First</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Banner with Target Domain Info */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
                  <FileSearch className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold font-head text-text">Target: {selectedWebsite?.name}</h3>
                    <span className="text-[11px] font-mono text-muted">({selectedWebsite?.domain})</span>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    Safe lightweight crawler with DNS validation, private IP blocking, and robots.txt compliance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsTriggerModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-10 px-4 border border-border bg-card hover:bg-slate-50 text-text rounded-md text-xs font-medium shadow-xs transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-muted" />
                <span>Configure Crawl</span>
              </button>
            </div>

        {/* Task Added Notification Banner */}
        {taskAddedNotice && (
          <div className="p-3.5 rounded-md bg-primary-tint border border-emerald-200 text-xs text-text flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary shrink-0" />
              <span>{taskAddedNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-medium text-accent hover:underline">
              View in Action Center →
            </Link>
          </div>
        )}

        {/* Score Cards Row */}
        {latestRun && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Technical SEO Score</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-text tracking-tight tnum">{latestRun.seoScore}</span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                Evaluates crawlability, canonicals, status codes & tags
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>GEO Visibility Score</span>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-accent tracking-tight tnum">{latestRun.geoScore}</span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                Brand entity clarity & Generative Engine citations
              </p>
            </div>

            <div className="bg-card p-5 rounded-xl border border-border shadow-xs">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>AEO Direct Answer Score</span>
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-text tracking-tight tnum">{latestRun.aeoScore}</span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                Q&A structure & Answer Engine summary readiness
              </p>
            </div>
          </div>
        )}

        {/* Findings Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-card">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Categories ({findings.length})</option>
                <option value="technical">Technical</option>
                <option value="content">Content</option>
                <option value="geo">GEO (Generative Engine)</option>
                <option value="aeo">AEO (Answer Engine)</option>
                <option value="indexability">Indexability</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High / Warning</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-muted font-mono">
            Displaying <strong className="text-text">{filteredFindings.length}</strong> findings
          </div>
        </div>

        {/* Findings Result Cards */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden divide-y divide-border">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="p-6 hover:bg-bg transition-colors space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    finding.severity === 'critical' ? 'bg-red-50 text-error border border-red-200' :
                    finding.severity === 'high' ? 'bg-amber-50 text-warning border border-amber-200' :
                    'bg-emerald-50 text-primary border border-emerald-200'
                  }`}>
                    {finding.severity === 'critical' ? 'Critical' : finding.severity === 'high' ? 'Warning' : 'Good'}
                  </span>
                  <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">{finding.category}</span>
                  <span className="text-xs text-border">•</span>
                  <span className="text-xs text-muted">
                    Confidence: <strong className="text-text font-mono">{finding.confidenceLevel}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Link
                    href="/dashboard/action-center"
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-accent text-xs font-medium shadow-xs transition-colors"
                  >
                    <Bot className="w-3.5 h-3.5 text-accent" />
                    <span>Fix with agent</span>
                  </Link>

                  <button
                    onClick={() => handleCreateTask(finding.id)}
                    className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-text text-xs font-medium shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                    <span>Create Task</span>
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold font-head text-text">{finding.title}</h4>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{finding.description}</p>
                <p className="text-xs font-mono text-muted mt-1 truncate">
                  Target: {finding.url}
                </p>
              </div>

              {/* Evidence & Snippet Box */}
              <div className="p-3.5 rounded-md bg-bg border border-border text-xs space-y-1.5">
                <div className="text-text">
                  <strong className="text-text">Detection Method:</strong> {finding.detectionMethod}
                </div>
                <div className="text-text">
                  <strong className="text-text">Expected:</strong> {finding.evidence.expected}
                </div>
                <div className="text-text">
                  <strong className="text-text">Actual Evidence:</strong> {finding.evidence.actual}
                </div>
                {finding.evidence.snippet && (
                  <div className="mt-2 font-mono text-[11px] bg-card p-2.5 rounded-md border border-border text-text overflow-x-auto">
                    {finding.evidence.snippet}
                  </div>
                )}
              </div>

              {/* Recommendation row */}
              <div className="pt-1 text-xs text-text font-medium flex items-center gap-1.5">
                <span className="text-primary font-bold">Recommended Action:</span>
                <span className="text-muted">{finding.recommendation}</span>
              </div>
            </div>
          ))}

          {filteredFindings.length === 0 && (
            <div className="text-center py-16 space-y-3">
              <FileSearch className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-medium text-text">No findings match the selected filters.</p>
              <button
                onClick={() => { setCategoryFilter('all'); setSeverityFilter('all'); }}
                className="px-4 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs shadow-xs"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Recent Audit Runs History (48px table rows) */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-bold font-head text-text">Audit History ({auditRuns.length})</h3>
          </div>
          <div className="divide-y divide-border">
            {auditRuns.map((run) => (
              <div key={run.id} className="h-12 px-4 flex items-center justify-between text-xs hover:bg-bg transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-medium text-text">
                    {new Date(run.startedAt).toLocaleDateString()}
                  </span>
                  <span className="text-muted font-mono text-[11px]">
                    {run.pagesCrawled} pages in {(run.crawlDurationMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="flex items-center gap-4 font-mono">
                  <span className="font-bold text-text tnum">{run.seoScore} <span className="text-[10px] text-muted font-normal">SEO</span></span>
                  <span className="font-bold text-text tnum">{run.geoScore} <span className="text-[10px] text-muted font-normal">GEO</span></span>
                  <span className="font-bold text-text tnum">{run.aeoScore} <span className="text-[10px] text-muted font-normal">AEO</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
          </>
        )}
      </div>

      {/* Trigger Audit Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-pop animate-in fade-in space-y-4">
            <h3 className="text-base font-bold font-head text-text">Launch Safe Website Audit</h3>
            <p className="text-xs text-muted">
              Select monitored website to initiate controlled in-house crawl and multi-factor evaluation.
            </p>

            {auditError && (
              <div className="p-3 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-error flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{auditError}</span>
              </div>
            )}

            {isAuditing ? (
              <div className="py-6 space-y-4">
                {/* Vertical Step Timeline for Active Crawl */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                    <span className="font-sans text-text">Anti-SSRF boundary validation</span>
                    <span className="font-mono text-[10px] text-muted ml-auto">12ms</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <RefreshCw className="w-4 h-4 text-accent animate-spin shrink-0" />
                    <span className="font-sans text-text">{auditProgressStep}</span>
                    <span className="font-mono text-[10px] text-accent ml-auto">active</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted opacity-60">
                    <span className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                    <span className="font-sans">GEO & AEO scoring</span>
                    <span className="font-mono text-[10px] ml-auto">queued</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Monitored Website</label>
                  <select
                    value={selectedWebsiteId}
                    onChange={(e) => setSelectedWebsiteId(e.target.value)}
                    className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.url})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-md bg-bg border border-border text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-text">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span>Safe Crawl Configuration:</span>
                  </div>
                  <p className="text-muted pl-5 font-mono text-[11px]">
                    Sample limit: 15 pages • Max depth: 1 • Rate limit: 400ms delay • Anti-SSRF active.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTriggerModalOpen(false)}
                    className="px-4 h-10 text-xs font-medium text-muted hover:text-text rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchAudit}
                    className="px-4 h-10 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-xs transition-colors"
                  >
                    Start Crawl & Audit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
