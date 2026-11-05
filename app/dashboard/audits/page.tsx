'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard-header';
import { supabase } from '@/lib/supabase';
import {
  AuditRun,
  AuditFinding,
  FindingCategory,
  FindingSeverity,
  FindingType,
  Website,
  CrawlJob,
  CrawlJobStatus,
} from '@/lib/types';
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
  Plus,
  Search,
  SlidersHorizontal,
  X,
  AlertCircle,
  Loader2,
  Cpu,
  Target,
  FileCheck,
  ChevronDown,
  Wrench,
  HelpCircle,
  StopCircle,
} from 'lucide-react';

export default function AuditsPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string>('');
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);

  // Audit and findings state
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);

  // Active crawl job state
  const [activeJob, setActiveJob] = useState<CrawlJob | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string>('');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [crawlMaxPages, setCrawlMaxPages] = useState<number>(15);
  const [crawlMaxDepth, setCrawlMaxDepth] = useState<number>(2);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'severity' | 'category' | 'url'>('severity');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Selected finding drawer
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [taskAddedNotice, setTaskAddedNotice] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // In-Drawer Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    outcome: string;
    explanation: string;
    afterEvidence?: string;
  } | null>(null);

  // Polling ref for cleanup
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch Websites on Mount directly from Supabase API
  useEffect(() => {
    let mounted = true;
    const fetchWebsites = async () => {
      setIsLoadingWebsites(true);
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
              const savedId = typeof window !== 'undefined' ? localStorage.getItem('rankpilot_active_website_id') : null;
              const targetId = savedId && cleanWebsites.some((w: Website) => w.id === savedId)
                ? savedId
                : cleanWebsites[0].id;

              setSelectedWebsiteId(targetId);
              if (typeof window !== 'undefined') {
                localStorage.setItem('rankpilot_active_website_id', targetId);
              }
            } else {
              setSelectedWebsiteId('');
            }
          }
        }
      } catch (err) {
        console.error('Failed to load websites:', err);
      } finally {
        if (mounted) setIsLoadingWebsites(false);
      }
    };

    fetchWebsites();
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Fetch Audits & Check for Active Crawl Jobs when Selected Website Changes
  useEffect(() => {
    if (!selectedWebsiteId) {
      setAuditRuns([]);
      setFindings([]);
      setActiveJob(null);
      setIsAuditing(false);
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('rankpilot_active_website_id', selectedWebsiteId);
    }

    let mounted = true;

    const fetchAuditData = async () => {
      setIsLoadingAudits(true);
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        // Fetch completed audit runs & findings
        const res = await fetch(`/api/audits?websiteId=${selectedWebsiteId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && mounted) {
            if (Array.isArray(data.auditRuns)) setAuditRuns(data.auditRuns);
            if (Array.isArray(data.findings)) setFindings(data.findings);
          }
        }

        // Check if there is an in-progress crawl job for this website
        const statusRes = await fetch(`/api/audits/status?websiteId=${selectedWebsiteId}`, { headers });
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.success && statusData.job && mounted) {
            const j = statusData.job as CrawlJob;
            if (['pending', 'queued', 'crawling', 'analyzing', 'generating_recommendations'].includes(j.status)) {
              setActiveJob(j);
              setIsAuditing(true);
              startPollingJob(j.id);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load audit history:', e);
      } finally {
        if (mounted) setIsLoadingAudits(false);
      }
    };

    fetchAuditData();

    return () => {
      mounted = false;
      stopPolling();
    };
  }, [selectedWebsiteId]);

  // 3. Polling engine for durable background crawl jobs
  const startPollingJob = (jobId: string) => {
    stopPolling();

    pollingTimerRef.current = setInterval(async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(`/api/audits/status?jobId=${jobId}`, { headers });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && data.job) {
          const job = data.job as CrawlJob;
          setActiveJob(job);

          if (['completed', 'partially_completed'].includes(job.status)) {
            stopPolling();
            setIsAuditing(false);
            if (data.auditRun) {
              setAuditRuns(prev => [data.auditRun, ...prev.filter(r => r.id !== data.auditRun.id)]);
            }
            if (Array.isArray(data.findings)) {
              setFindings(data.findings);
            }
          } else if (['failed', 'cancelled'].includes(job.status)) {
            stopPolling();
            setIsAuditing(false);
            setAuditError(job.errorMessage || 'Audit was terminated or failed.');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 1500);
  };

  const stopPolling = () => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  };

  // 4. Start Full Website Audit Handler
  const handleStartAudit = async () => {
    if (!selectedWebsiteId) return;

    setIsAuditing(true);
    setAuditError('');
    setIsConfigModalOpen(false);

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/audits/start', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          websiteId: selectedWebsiteId,
          maxPages: crawlMaxPages,
          maxDepth: crawlMaxDepth,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start background audit job.');
      }

      const newJob = data.job as CrawlJob;
      setActiveJob(newJob);
      startPollingJob(newJob.id);
    } catch (err: any) {
      setAuditError(err.message || 'Audit execution encountered a failure.');
      setIsAuditing(false);
    }
  };

  // 5. Cancel Audit Handler
  const handleCancelAudit = async () => {
    if (!activeJob) return;

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      await fetch('/api/audits/cancel', {
        method: 'POST',
        headers,
        body: JSON.stringify({ jobId: activeJob.id }),
      });

      stopPolling();
      setIsAuditing(false);
      setActiveJob(prev => prev ? { ...prev, status: 'cancelled', currentStage: 'Cancelled by user' } : null);
    } catch (err) {
      console.error('Failed to cancel crawl:', err);
    }
  };

  // 6. Add Finding to Action Center Handler
  const handleAddToTaskCenter = async (finding: AuditFinding) => {
    setIsAddingTask(true);
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
          websiteId: selectedWebsiteId,
          findingId: finding.id,
          title: finding.title,
          description: finding.description,
          category: finding.category,
          priority: finding.priority || (finding.severity === 'critical' ? 'critical' : 'high'),
          severity: finding.severity,
          affectedUrl: finding.url,
          recommendedSolution: finding.recommendation,
          verificationCriteria: finding.verificationCriteria,
          estimatedEffort: finding.estimatedEffort,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTaskAddedNotice(`Action task "${finding.title}" added to Action Center.`);
        setTimeout(() => setTaskAddedNotice(null), 4000);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  // 7. Verify Fix Handler in Drawer
  const handleVerifyFix = async (finding: AuditFinding) => {
    setIsVerifying(true);
    setVerificationFeedback(null);

    try {
      // Find or create task for this finding to run verification
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      // Create/ensure task exists
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          websiteId: selectedWebsiteId,
          findingId: finding.id,
          title: finding.title,
          description: finding.description,
          category: finding.category,
          priority: finding.severity === 'critical' ? 'critical' : 'high',
          affectedUrl: finding.url,
          recommendedSolution: finding.recommendation,
        }),
      });

      const taskData = await taskRes.json();
      const targetTaskId = taskData.task?.id;

      if (!targetTaskId) {
        throw new Error('Unable to initialize verification task.');
      }

      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskId: targetTaskId }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        const result = verifyData.result;
        setVerificationFeedback({
          outcome: result.outcome,
          explanation: result.explanation,
          afterEvidence: result.afterEvidence,
        });

        if (result.outcome === 'completed_verified') {
          // Mark resolved in local state
          setFindings(prev => prev.map(f => f.id === finding.id ? { ...f, isResolved: true } : f));
          if (selectedFinding?.id === finding.id) {
            setSelectedFinding(prev => prev ? { ...prev, isResolved: true } : null);
          }
        }
      }
    } catch (err: any) {
      setVerificationFeedback({
        outcome: 'unable_to_verify',
        explanation: err.message || 'Verification could not connect to target page.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId) || websites[0];
  const latestRun = auditRuns[0];

  // Filter & Search logic
  const filteredFindings = findings.filter(f => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    if (typeFilter !== 'all' && f.findingType !== typeFilter) return false;
    if (statusFilter === 'open' && f.isResolved) return false;
    if (statusFilter === 'resolved' && !f.isResolved) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = f.title.toLowerCase().includes(q);
      const matchUrl = f.url.toLowerCase().includes(q);
      const matchDesc = f.description.toLowerCase().includes(q);
      const matchType = (f.issueType || '').toLowerCase().includes(q);
      return matchTitle || matchUrl || matchDesc || matchType;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'severity') {
      const order: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, notice: 1, info: 1 };
      return (order[b.severity] || 0) - (order[a.severity] || 0);
    }
    if (sortBy === 'category') return a.category.localeCompare(b.category);
    return a.url.localeCompare(b.url);
  });

  const totalPages = Math.max(1, Math.ceil(filteredFindings.length / pageSize));
  const paginatedFindings = filteredFindings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary counts
  const summaryCounts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low' || f.severity === 'notice').length,
    opportunities: findings.filter(f => f.findingType === 'opportunity').length,
    notTested: findings.filter(f => f.findingType === 'not_tested').length,
    resolved: findings.filter(f => f.isResolved).length,
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Audit & Crawl Engine"
        subtitle="Deterministic technical website crawler evaluating 30+ search standards, GEO brand authority, and AEO answer readiness"
        actionButton={
          websites.length > 0 ? (
            <button
              onClick={() => setIsConfigModalOpen(true)}
              disabled={isAuditing}
              className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-md text-xs font-semibold shadow-xs transition-colors ${
                isAuditing
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-hover text-white'
              }`}
            >
              {isAuditing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Audit in Progress...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Full Website Audit</span>
                </>
              )}
            </button>
          ) : undefined
        }
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Loading state for websites */}
        {isLoadingWebsites && (
          <div className="bg-card rounded-lg border border-border p-8 text-center flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs text-muted">Loading connected websites...</p>
          </div>
        )}

        {/* Empty State: No Websites Connected */}
        {!isLoadingWebsites && websites.length === 0 && (
          <div className="bg-card rounded-lg border border-dashed border-border p-12 text-center shadow-card flex flex-col items-center justify-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold font-head text-text">
                No client websites connected yet
              </h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Before running an automated crawler audit, connect a website to set DNS boundaries, safe crawl allowances, and authorized domain scopes.
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
        )}

        {/* Website Selector & Active Property Header */}
        {!isLoadingWebsites && websites.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-lg bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted">Audited Property:</span>
                  <select
                    value={selectedWebsiteId}
                    onChange={(e) => setSelectedWebsiteId(e.target.value)}
                    className="text-xs font-bold font-head px-3 py-1.5 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} — {w.domain}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedWebsite && (
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                    <span className="font-mono">{selectedWebsite.url}</span>
                    <span>•</span>
                    <span>Status: <strong className="text-emerald-600 font-semibold uppercase">{selectedWebsite.status}</strong></span>
                    {selectedWebsite.lastAuditedAt && (
                      <>
                        <span>•</span>
                        <span>Last Audit: <strong>{new Date(selectedWebsite.lastAuditedAt).toLocaleDateString()}</strong></span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsConfigModalOpen(true)}
                disabled={isAuditing}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-border bg-card hover:bg-slate-50 text-text rounded-md text-xs font-medium shadow-xs transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-muted" />
                <span>Crawl Scope</span>
              </button>

              <button
                onClick={() => handleStartAudit()}
                disabled={isAuditing}
                className="inline-flex items-center gap-1.5 h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Task Added Notification Toast */}
        {taskAddedNotice && (
          <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskAddedNotice}</span>
            </div>
            <Link href="/dashboard/action-center" className="font-semibold text-emerald-700 hover:underline">
              View in Action Center →
            </Link>
          </div>
        )}

        {/* Audit Error Alert */}
        {auditError && (
          <div className="p-4 rounded-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold">Audit Notice:</strong>
              <p>{auditError}</p>
            </div>
          </div>
        )}

        {/* Real-Time Background Crawl Progress Box */}
        {isAuditing && activeJob && (
          <div className="bg-card rounded-lg border-2 border-primary/40 p-6 shadow-md space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <h4 className="text-sm font-bold font-head text-text">
                    {activeJob.currentStage || 'Executing audit pipeline...'}
                  </h4>
                  <p className="text-xs text-muted">
                    Durable background crawler running. State is persisted and recovers after page refresh.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-primary tnum">
                  {activeJob.progressPercent}%
                </span>
                <button
                  onClick={handleCancelAudit}
                  className="inline-flex items-center gap-1 h-8 px-2.5 rounded border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium transition-colors"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel Crawl</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.max(5, activeJob.progressPercent)}%` }}
              ></div>
            </div>

            {/* Live Crawl Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-bg/60 p-3 rounded border border-border">
                <span className="text-[11px] text-muted block">URLs Discovered</span>
                <span className="text-lg font-bold font-head text-text tnum">{activeJob.urlsDiscovered}</span>
              </div>
              <div className="bg-bg/60 p-3 rounded border border-border">
                <span className="text-[11px] text-muted block">URLs Crawled</span>
                <span className="text-lg font-bold font-head text-emerald-600 tnum">{activeJob.urlsCrawled}</span>
              </div>
              <div className="bg-bg/60 p-3 rounded border border-border">
                <span className="text-[11px] text-muted block">URLs Remaining</span>
                <span className="text-lg font-bold font-head text-text tnum">{activeJob.urlsRemaining}</span>
              </div>
              <div className="bg-bg/60 p-3 rounded border border-border">
                <span className="text-[11px] text-muted block">Failed / Blocked</span>
                <span className="text-lg font-bold font-head text-amber-600 tnum">{activeJob.urlsFailed}</span>
              </div>
            </div>
          </div>
        )}

        {/* Score Dashboard: 4 Modern Score Cards */}
        {latestRun && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall SEO Health */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>SEO Score</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                  {latestRun.seoScore}
                </span>
                <span className="text-xs text-muted">/ 100</span>
                {latestRun.isProvisionalScore && (
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Provisional
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted">
                Composite of Technical (40%), Indexability (35%), Content (25%).
              </p>
            </div>

            {/* 2. Technical SEO Score */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>Technical SEO Score</span>
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                  {latestRun.technicalScore || latestRun.seoScore}
                </span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="text-[11px] text-muted">
                Crawlability, robots, status codes, canonicals & viewport.
              </p>
            </div>

            {/* 3. GEO Score */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>GEO Score</span>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-accent tracking-tight tnum">
                  {latestRun.geoScore}
                </span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="text-[11px] text-muted">
                Generative Engine brand clarity, Organization & author entities.
              </p>
            </div>

            {/* 4. AEO Score */}
            <div className="bg-card p-5 rounded-xl border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-muted">
                <span>AEO Score</span>
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-head text-text tracking-tight tnum">
                  {latestRun.aeoScore}
                </span>
                <span className="text-xs text-muted">/ 100</span>
              </div>
              <p className="text-[11px] text-muted">
                Answer Engine Q&A coverage, direct definitions & list format.
              </p>
            </div>
          </div>
        )}

        {/* Audit Summary Badges */}
        {latestRun && (
          <div className="bg-card rounded-lg border border-border p-4 shadow-card flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium">
                <FileSearch className="w-4 h-4 text-muted" />
                <span>Pages Crawled: <strong>{latestRun.pagesCrawled}</strong></span>
              </div>
              <span className="text-border">•</span>
              <div className="flex items-center gap-1.5 font-medium">
                <span>Total Findings: <strong>{findings.length}</strong></span>
              </div>
              <span className="text-border">•</span>
              <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-medium">
                {summaryCounts.critical} Critical
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                {summaryCounts.high} High / Warning
              </span>
              <span className="px-2 py-0.5 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 font-medium">
                {summaryCounts.medium} Medium
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                {summaryCounts.low} Low / Notice
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                {summaryCounts.opportunities} Opportunities
              </span>
              {summaryCounts.resolved > 0 && (
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-medium">
                  {summaryCounts.resolved} Verified Resolved
                </span>
              )}
            </div>

            <Link
              href="/dashboard/reports"
              className="font-medium text-accent hover:underline flex items-center gap-1"
            >
              <span>View Executive Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Findings Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-card">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search findings by title, URL or type..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full text-xs pl-8 pr-3 h-9 rounded-md border border-border bg-card text-text placeholder:text-muted/60 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 h-9 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="technical">Technical SEO</option>
              <option value="indexability">Indexability</option>
              <option value="content">On-Page Content</option>
              <option value="geo">GEO (Generative Engine)</option>
              <option value="aeo">AEO (Answer Engine)</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 h-9 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="notice">Notice</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 h-9 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="all">All Finding Types</option>
              <option value="confirmed_error">Confirmed Error</option>
              <option value="warning">Warning</option>
              <option value="opportunity">Opportunity</option>
              <option value="informational">Informational</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 h-9 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Findings</option>
              <option value="resolved">Verified Resolved</option>
            </select>
          </div>

          <div className="text-xs text-muted font-mono shrink-0">
            Showing <strong className="text-text">{filteredFindings.length}</strong> findings
          </div>
        </div>

        {/* Findings Table */}
        <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
          {paginatedFindings.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted space-y-2">
              <FileSearch className="w-8 h-8 text-muted mx-auto" />
              <p>No audit findings match your current search and filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {paginatedFindings.map((finding) => (
                <div
                  key={finding.id}
                  onClick={() => {
                    setSelectedFinding(finding);
                    setVerificationFeedback(null);
                    setIsDrawerOpen(true);
                  }}
                  className="p-5 hover:bg-bg/60 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          finding.severity === 'critical'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : finding.severity === 'high'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : finding.severity === 'medium'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {finding.severity}
                      </span>

                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-bg text-muted border border-border">
                        {finding.category}
                      </span>

                      {finding.findingType && (
                        <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-bg text-muted">
                          {finding.findingType.replace('_', ' ')}
                        </span>
                      )}

                      {finding.isResolved && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Resolved
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>Effort: <strong className="text-text capitalize">{finding.estimatedEffort || 'Moderate'}</strong></span>
                      <span>•</span>
                      <ChevronRight className="w-4 h-4 text-muted" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold font-head text-text hover:text-primary transition-colors">
                      {finding.title}
                    </h4>
                    <p className="text-xs text-muted mt-1 line-clamp-2">
                      {finding.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted pt-1">
                    <div className="flex items-center gap-1.5 truncate max-w-xl font-mono">
                      <Globe className="w-3 h-3 shrink-0" />
                      <span className="truncate">{finding.url}</span>
                    </div>

                    <span className="shrink-0 text-primary font-medium text-xs">
                      View Evidence & Solution →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded border border-border bg-card hover:bg-slate-50 disabled:opacity-50 text-text"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded border border-border bg-card hover:bg-slate-50 disabled:opacity-50 text-text"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-Over Drawer for Finding Inspection & Solution */}
      {isDrawerOpen && selectedFinding && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-card border-l border-border h-full overflow-y-auto p-6 space-y-6 shadow-2xl animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      selectedFinding.severity === 'critical'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : selectedFinding.severity === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {selectedFinding.severity}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-bg text-muted border border-border">
                    {selectedFinding.category}
                  </span>
                  <span className="text-[10px] font-mono capitalize px-2 py-0.5 rounded bg-bg text-muted">
                    {selectedFinding.findingType?.replace('_', ' ') || 'Confirmed Error'}
                  </span>
                  {selectedFinding.isResolved && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Resolved
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold font-head text-text mt-2">
                  {selectedFinding.title}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-md hover:bg-bg flex items-center justify-center text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Affected URL Banner */}
            <div className="bg-bg p-3.5 rounded-md border border-border flex items-center justify-between text-xs font-mono">
              <div className="truncate mr-2">
                <span className="text-muted block text-[10px] uppercase font-sans mb-0.5">Affected URL</span>
                <span className="text-text truncate select-all">{selectedFinding.url}</span>
              </div>
              <a
                href={selectedFinding.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline shrink-0 text-xs font-sans"
              >
                <span>Visit Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Why It Matters */}
            {selectedFinding.whyItMatters && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold font-head uppercase tracking-wider text-muted">
                  Why This Matters for Search & Discovery
                </h4>
                <p className="text-xs text-text leading-relaxed bg-primary-tint/40 p-3.5 rounded border border-emerald-100">
                  {selectedFinding.whyItMatters}
                </p>
              </div>
            )}

            {/* Exact Evidence Observed */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-head uppercase tracking-wider text-muted">
                Audit Evidence & Detection Method
              </h4>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-md space-y-2.5 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Detection Method</span>
                  <span>{selectedFinding.detectionMethod}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-emerald-400 block text-[10px] uppercase font-sans">Expected Condition</span>
                  <span>{selectedFinding.evidence?.expected}</span>
                </div>
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-red-400 block text-[10px] uppercase font-sans">Actual Condition Detected</span>
                  <span>{selectedFinding.evidence?.actual}</span>
                </div>
                {selectedFinding.evidence?.snippet && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans">Observed Code Snippet</span>
                    <pre className="text-[11px] overflow-x-auto text-amber-300 mt-1 p-2 bg-slate-950 rounded">
                      {selectedFinding.evidence.snippet}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Solution */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold font-head uppercase tracking-wider text-muted">
                Recommended Solution
              </h4>
              <p className="text-xs text-text leading-relaxed">
                {selectedFinding.recommendation}
              </p>

              {/* Step-by-step Implementation Steps */}
              {selectedFinding.implementationSteps && selectedFinding.implementationSteps.length > 0 && (
                <div className="mt-3 bg-bg p-4 rounded-md border border-border space-y-2">
                  <span className="text-[11px] font-bold font-head uppercase text-text block">
                    Step-by-Step Implementation Instructions:
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-text">
                    {selectedFinding.implementationSteps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Verification Criteria */}
            {selectedFinding.verificationCriteria && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold font-head uppercase tracking-wider text-muted">
                  Fix Verification Criteria
                </h4>
                <p className="text-xs text-muted italic">
                  {selectedFinding.verificationCriteria}
                </p>
              </div>
            )}

            {/* Live Verification Feedback Banner */}
            {verificationFeedback && (
              <div
                className={`p-4 rounded-md text-xs border space-y-1.5 animate-in fade-in ${
                  verificationFeedback.outcome === 'completed_verified'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold font-head">
                  {verificationFeedback.outcome === 'completed_verified' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Verification Passed: Issue Resolved</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Verification Result: Issue Still Unresolved</span>
                    </>
                  )}
                </div>
                <p>{verificationFeedback.explanation}</p>
                {verificationFeedback.afterEvidence && (
                  <p className="font-mono text-[11px] pt-1 text-slate-700">
                    Observed in live crawl: {verificationFeedback.afterEvidence}
                  </p>
                )}
              </div>
            )}

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToTaskCenter(selectedFinding)}
                  disabled={isAddingTask}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isAddingTask ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Add to Action Center</span>
                </button>

                <button
                  onClick={() => handleVerifyFix(selectedFinding)}
                  disabled={isVerifying}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md border border-border bg-card hover:bg-slate-50 text-text text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isVerifying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5 text-muted" />
                  )}
                  <span>Verify Fix Now</span>
                </button>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="text-xs text-muted hover:text-text px-3 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crawl Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold font-head text-text">Configure Website Audit</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="w-7 h-7 rounded hover:bg-bg flex items-center justify-center text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-text block mb-1">Target Website:</label>
                <div className="p-2.5 bg-bg rounded border border-border font-mono text-muted">
                  {selectedWebsite?.name} ({selectedWebsite?.url})
                </div>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">
                  Crawl Page Allowance (Limit):
                </label>
                <select
                  value={crawlMaxPages}
                  onChange={(e) => setCrawlMaxPages(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={10}>10 Pages (Fast Sample)</option>
                  <option value={25}>25 Pages (Standard Audit)</option>
                  <option value={50}>50 Pages (Deep Audit)</option>
                  <option value={100}>100 Pages (Comprehensive Workspace)</option>
                </select>
                <span className="text-[11px] text-muted mt-1 block">
                  Crawl will enforce server-side limits according to your current organization subscription plan.
                </span>
              </div>

              <div>
                <label className="font-semibold text-text block mb-1">Crawl Depth Limit:</label>
                <select
                  value={crawlMaxDepth}
                  onChange={(e) => setCrawlMaxDepth(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value={1}>1 Hop (Direct links from homepage)</option>
                  <option value={2}>2 Hops (Standard site structure)</option>
                  <option value={3}>3 Hops (Deep nested architecture)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-end gap-2.5">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="h-9 px-3.5 rounded border border-border text-xs text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStartAudit()}
                className="h-9 px-4 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs"
              >
                Launch Background Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
