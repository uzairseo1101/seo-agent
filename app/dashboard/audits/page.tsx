'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { AuditRun, AuditFinding, FindingCategory, FindingSeverity } from '@/lib/types';
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
  Sparkles
} from 'lucide-react';

export default function AuditsPage() {
  const [websites] = useState(storage.getWebsites());
  const [selectedWebsiteId, setSelectedWebsiteId] = useState(websites[0]?.id || '');
  const [auditRuns, setAuditRuns] = useState<AuditRun[]>(storage.getAuditRuns());
  const [findings, setFindings] = useState<AuditFinding[]>(storage.getFindings());

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedFinding, setSelectedFinding] = useState<AuditFinding | null>(null);

  // Trigger Modal & Progress state
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgressStep, setAuditProgressStep] = useState<string>('');
  const [auditError, setAuditError] = useState<string>('');
  const [taskAddedNotice, setTaskAddedNotice] = useState<string | null>(null);

  const selectedWebsite = websites.find(w => w.id === selectedWebsiteId) || websites[0];
  const latestRun = auditRuns[0];

  const handleLaunchAudit = async () => {
    if (!selectedWebsiteId) return;

    setIsAuditing(true);
    setAuditError('');
    setAuditProgressStep('Validating URL against anti-SSRF boundaries...');

    try {
      // Simulate real-time steps for user feedback
      setTimeout(() => setAuditProgressStep('Fetching robots.txt and sitemap.xml...'), 400);
      setTimeout(() => setAuditProgressStep('Executing controlled sample crawl (Cheerio)...'), 900);
      setTimeout(() => setAuditProgressStep('Running 30+ Technical SEO checks...'), 1400);
      setTimeout(() => setAuditProgressStep('Calculating GEO authority & AEO answer readiness...'), 1900);

      const res = await fetch('/api/audits/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteId: selectedWebsiteId,
          maxPages: 15,
          maxDepth: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Audit execution failed.');
      }

      // Update state with newly saved audit run and findings
      setAuditRuns([...storage.getAuditRuns()]);
      setFindings([...storage.getFindings()]);
      setIsTriggerModalOpen(false);
      setIsAuditing(false);
    } catch (err: any) {
      setAuditError(err.message || 'Audit failed.');
      setIsAuditing(false);
    }
  };

  const handleCreateTask = (findingId: string) => {
    const newTask = storage.createActionItemFromFinding(findingId);
    if (newTask) {
      setTaskAddedNotice(`Task created: "${newTask.title}"`);
      setTimeout(() => setTaskAddedNotice(null), 3500);
    }
  };

  const filteredFindings = findings.filter(f => {
    if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div>
      <DashboardHeader
        title="SEO, GEO & AEO Website Audits"
        subtitle="Safe in-house crawls evaluating 30+ technical standards, entity clarity and answer engine readiness"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner with Launch Audit CTA */}
        <div className="bg-white rounded-xl border border-surface-border p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand-600">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy">Target Domain: {selectedWebsite?.name}</h3>
                <span className="text-[11px] font-mono text-surface-muted">({selectedWebsite?.domain})</span>
              </div>
              <p className="text-xs text-surface-muted mt-0.5">
                Safe lightweight crawler with DNS validation, private IP blocking, and robots.txt compliance.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsTriggerModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Launch Audit</span>
          </button>
        </div>

        {/* Task Added Notification Banner */}
        {taskAddedNotice && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{taskAddedNotice}</span>
            </div>
            <a href="/dashboard/action-center" className="font-semibold text-emerald-900 underline hover:no-underline">
              View in Action Center →
            </a>
          </div>
        )}

        {/* Score Cards Row */}
        {latestRun && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-surface-muted">
                <span>Technical SEO Score</span>
                <span className="text-[11px] text-emerald-600 font-bold">Standard Formula</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy">{latestRun.seoScore}</span>
                <span className="text-xs text-surface-muted">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-surface-muted">
                Technical (45%) + Indexability (30%) + Content (25%)
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-surface-muted">
                <span>GEO Visibility Score</span>
                <span className="text-[11px] text-brand-600 font-bold">Proprietary</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy">{latestRun.geoScore}</span>
                <span className="text-xs text-surface-muted">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-surface-muted">
                Brand entity clarity & author citation authority
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-surface-border shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold text-surface-muted">
                <span>AEO Direct Answer Score</span>
                <span className="text-[11px] text-brand-600 font-bold">Proprietary</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-navy">{latestRun.aeoScore}</span>
                <span className="text-xs text-surface-muted">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-surface-muted">
                Q&A structure & direct answer summary coverage
              </p>
            </div>
          </div>
        )}

        {/* Findings Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-muted">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
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
              <span className="text-xs font-semibold text-surface-muted">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="info">Info</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-surface-muted">
            Displaying <strong className="text-navy">{filteredFindings.length}</strong> findings
          </div>
        </div>

        {/* Findings List with Evidence Drawer */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden divide-y divide-surface-border">
          {filteredFindings.map((finding) => (
            <div key={finding.id} className="p-5 hover:bg-slate-50/70 transition-colors space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    finding.severity === 'critical' ? 'bg-red-100 text-red-700' :
                    finding.severity === 'high' ? 'bg-amber-100 text-amber-700' :
                    finding.severity === 'medium' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {finding.severity}
                  </span>
                  <span className="text-xs font-bold text-surface-muted uppercase">{finding.category}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-surface-muted">
                    Confidence: <strong className="text-navy">{finding.confidenceLevel}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleCreateTask(finding.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-brand-700 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                  <span>Create Action Task</span>
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold text-navy">{finding.title}</h4>
                <p className="text-xs text-surface-muted mt-0.5">{finding.description}</p>
                <p className="text-xs font-mono text-slate-500 mt-1 truncate">
                  Affected URL: {finding.url}
                </p>
              </div>

              {/* Evidence & Snippet Box */}
              <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-xs space-y-1.5">
                <div className="text-slate-700">
                  <strong className="text-navy">Detection Method:</strong> {finding.detectionMethod}
                </div>
                <div className="text-slate-700">
                  <strong className="text-navy">Expected:</strong> {finding.evidence.expected}
                </div>
                <div className="text-slate-700">
                  <strong className="text-navy">Actual Evidence:</strong> {finding.evidence.actual}
                </div>
                {finding.evidence.snippet && (
                  <div className="mt-2 font-mono text-[11px] bg-white p-2.5 rounded border border-slate-200 text-slate-700 overflow-x-auto">
                    {finding.evidence.snippet}
                  </div>
                )}
              </div>

              {/* Recommendation row */}
              <div className="pt-1 text-xs text-brand-800 font-medium">
                <strong>Recommended Action:</strong> {finding.recommendation}
              </div>
            </div>
          ))}

          {filteredFindings.length === 0 && (
            <div className="text-center py-12">
              <FileSearch className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-navy">No findings match the selected filters.</p>
            </div>
          )}
        </div>

        {/* Recent Audit Runs History */}
        <div className="bg-white rounded-xl border border-surface-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-navy">Audit History ({auditRuns.length})</h3>
          </div>
          <div className="divide-y divide-surface-border">
            {auditRuns.map((run) => (
              <div key={run.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50">
                <div>
                  <span className="font-bold text-navy">
                    {new Date(run.startedAt).toLocaleString()}
                  </span>
                  <p className="text-surface-muted mt-0.5">
                    Crawled {run.pagesCrawled} sample pages in {(run.crawlDurationMs / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="font-bold text-navy">{run.seoScore}</span>
                    <span className="text-[10px] text-surface-muted block">SEO</span>
                  </div>
                  <div>
                    <span className="font-bold text-navy">{run.geoScore}</span>
                    <span className="text-[10px] text-surface-muted block">GEO</span>
                  </div>
                  <div>
                    <span className="font-bold text-navy">{run.aeoScore}</span>
                    <span className="text-[10px] text-surface-muted block">AEO</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trigger Audit Modal */}
      {isTriggerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-surface-border max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-navy">Launch Safe Website Audit</h3>
            <p className="text-xs text-surface-muted">
              Select monitored website to initiate controlled in-house crawl and multi-factor evaluation.
            </p>

            {auditError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{auditError}</span>
              </div>
            )}

            {isAuditing ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-bold text-navy">Audit in Progress...</p>
                <p className="text-xs text-surface-muted animate-pulse">{auditProgressStep}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">Monitored Website</label>
                  <select
                    value={selectedWebsiteId}
                    onChange={(e) => setSelectedWebsiteId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white outline-none"
                  >
                    {websites.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.url})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-navy">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Safe Crawl Configuration:</span>
                  </div>
                  <p className="text-surface-muted pl-5">
                    Sample limit: 15 pages • Max depth: 1 • Rate limit: 400ms delay • Anti-SSRF DNS verification active.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsTriggerModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-navy rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLaunchAudit}
                    className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
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
