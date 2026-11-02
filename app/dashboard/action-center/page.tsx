'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { ActionItem, TaskPriority, TaskStatus, FindingCategory } from '@/lib/types';
import {
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Plus,
  RefreshCw,
  ShieldCheck,
  Calendar,
  Edit3,
  FileText,
  X,
  Check,
  Bot,
  Terminal,
  Send,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  steps?: { title: string; timing: string; status: 'queued' | 'running' | 'done' | 'failed' }[];
  logs?: string[];
}

export default function ActionCenterPage() {
  const [tasks, setTasks] = useState<ActionItem[]>(storage.getActionItems());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Sync tasks on mount & tab focus from database API
  React.useEffect(() => {
    let mounted = true;
    const fetchTasks = async () => {
      try {
        const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }
        const activeWebId = typeof window !== 'undefined' ? localStorage.getItem('rankpilot_active_website_id') : null;
        const url = activeWebId ? `/api/tasks?websiteId=${activeWebId}` : '/api/tasks';

        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.tasks && mounted) {
            setTasks(data.tasks);
          }
        }
      } catch (e) {
        // Fallback to storage
      }
    };
    fetchTasks();
    return () => {
      mounted = false;
    };
  }, []);

  // Modals & Active task inspection
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    taskId: string;
    outcome: string;
    explanation: string;
    afterEvidence: string;
  } | null>(null);

  // AI Agent Chat & Reasoning State
  const [isAgentPanelOpen, setIsAgentPanelOpen] = useState(false);
  const [agentTargetTask, setAgentTargetTask] = useState<ActionItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'agent',
      text: "Hello! I am your RankPilot AI Agent. Select any finding or ask me to draft Schema.org code, inspect heading hierarchies, or plan automated re-verifications.",
      timestamp: 'Just now',
    },
  ]);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<FindingCategory>('technical');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    storage.updateActionItemStatus(id, newStatus);
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      // Retain local update
    }
  };

  const handleVerifyTask = async (taskId: string) => {
    setVerifyingTaskId(taskId);
    setVerificationFeedback(null);

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const res = await fetch('/api/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification re-check failed.');
      }

      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'completed',
            verificationStatus: data.result.outcome,
          };
        }
        return t;
      }));

      setVerificationFeedback({
        taskId,
        outcome: data.result.outcome,
        explanation: data.result.explanation,
        afterEvidence: data.result.afterEvidence,
      });
      setVerifyingTaskId(null);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
      setVerifyingTaskId(null);
    }
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    try {
      const { data: { session } } = (await supabase?.auth.getSession()) || { data: { session: null } };
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      const activeWebId = typeof window !== 'undefined' ? localStorage.getItem('rankpilot_active_website_id') : undefined;

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: newTitle,
          affectedUrl: newUrl,
          category: newCategory,
          priority: newPriority,
          dueDate: newDueDate,
          websiteId: activeWebId,
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        setTasks(prev => [data.task, ...prev]);
        setIsNewTaskModalOpen(false);
        setNewTitle('');
        setNewUrl('');
        setNewDueDate('');
      }
    } catch (err) {
      console.error('Task creation failed:', err);
    }
  };

  // Launch AI Agent assistance for a specific task
  const handleFixWithAgent = (task: ActionItem) => {
    setAgentTargetTask(task);
    setIsAgentPanelOpen(true);
    setIsAnalyzing(true);

    const userQuery: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: `Analyze and resolve: "${task.title}" on ${task.affectedUrl}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userQuery]);

    // Simulate Agent Step-by-Step execution
    setTimeout(() => {
      setIsAnalyzing(false);
      const agentReply: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: `I've analyzed the affected URL and technical guidelines for "${task.title}". Here is the recommended verified solution:`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: [
          { title: 'DOM Inspection & HTML parsing', timing: '140ms', status: 'done' },
          { title: 'Schema.org JSON-LD syntax verification', timing: '320ms', status: 'done' },
          { title: 'Drafting drop-in implementation snippet', timing: '410ms', status: 'done' },
          { title: 'Anti-SSRF re-audit schedule', timing: 'pending', status: 'queued' },
        ],
        logs: [
          `[INFO] Target: ${task.affectedUrl}`,
          `[AUDIT] Issue category: ${task.category.toUpperCase()} | Priority: ${task.priority.toUpperCase()}`,
          `[EVIDENCE] ${task.description}`,
          `[RECOMMENDATION] ${task.steps.join(' -> ')}`,
        ],
      };
      setChatMessages((prev) => [...prev, agentReply]);
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      const reply: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: `Understood. Based on verified crawl rules, ensure the target HTML strictly complies with W3C standards before triggering the re-audit engine.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        steps: [
          { title: 'Rule verification against local index', timing: '95ms', status: 'done' },
          { title: 'Ready for re-crawl verification', timing: 'ready', status: 'done' },
        ],
      };
      setChatMessages((prev) => [...prev, reply]);
    }, 900);
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="SEO Action Center & Verification"
        subtitle="Turn audit issues and GSC opportunities into prioritized work, then verify fixes via automated re-audits"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Verification Result Feedback Drawer / Card */}
        {verificationFeedback && (
          <div className="p-5 rounded-xl bg-card border-2 border-primary shadow-xs animate-in fade-in space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {verificationFeedback.outcome === 'completed_verified' ? (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-primary bg-primary-tint border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Completed — Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-warning bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Still Unresolved
                  </span>
                )}
                <span className="text-xs font-bold font-head text-text">Re-Crawl Verification Result</span>
              </div>
              <button
                onClick={() => setVerificationFeedback(null)}
                className="text-muted hover:text-text text-xs p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              {verificationFeedback.explanation}
            </p>
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 border border-border font-mono text-[11px] text-text">
              Evidence captured: {verificationFeedback.afterEvidence}
            </div>
          </div>
        )}

        {/* Filter Bar & Header Controls (Single Primary Button) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-3 h-9 rounded-lg border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-xs"
              >
                <option value="all">All Statuses ({tasks.length})</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium px-3 h-9 rounded-lg border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer shadow-xs"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={() => setIsAgentPanelOpen(!isAgentPanelOpen)}
              className="h-9 px-3.5 rounded-lg border border-border bg-card hover:bg-slate-50 text-accent font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-accent" />
              <span>{isAgentPanelOpen ? 'Hide Agent Chat' : 'Open Agent Chat'}</span>
            </button>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* Layout Grid: Tasks List + AI Agent Assistant */}
        <div className={`grid grid-cols-1 ${isAgentPanelOpen ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
          {/* Main Task List (2 cols when agent open) */}
          <div className={`${isAgentPanelOpen ? 'lg:col-span-2' : ''} space-y-4`}>
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-card rounded-xl border border-border p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Severity / Priority Badge */}
                    <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      task.priority === 'critical' ? 'bg-red-50 text-error border border-red-200' :
                      task.priority === 'high' ? 'bg-amber-50 text-warning border border-amber-200' :
                      'bg-emerald-50 text-primary border border-emerald-200'
                    }`}>
                      {task.priority === 'critical' ? 'Critical' : task.priority === 'high' ? 'Warning' : 'Good'} Priority
                    </span>
                    <span className="text-xs font-mono font-medium text-muted uppercase tracking-wider">{task.category}</span>
                    <span className="text-xs text-border">•</span>
                    <span className="text-xs text-muted capitalize">Source: {task.sourceType.replace('_', ' ')}</span>
                  </div>

                  {/* Verification Outcome & Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {task.verificationStatus === 'completed_verified' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-primary-tint text-primary border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Completed — Verified
                      </span>
                    ) : task.verificationStatus === 'still_unresolved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-error border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-error" />
                        Still Unresolved
                      </span>
                    ) : task.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-amber-50 text-warning border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Re-Audit
                      </span>
                    ) : null}

                    {/* Secondary Action: Fix with Agent */}
                    <button
                      onClick={() => handleFixWithAgent(task)}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-accent transition-colors shadow-xs"
                      title="Analyze with AI Agent"
                    >
                      <Bot className="w-3.5 h-3.5 text-accent" />
                      <span>Fix with agent</span>
                    </button>

                    {/* Secondary Action: Verify Fix Now */}
                    <button
                      onClick={() => handleVerifyTask(task.id)}
                      disabled={verifyingTaskId === task.id}
                      className="inline-flex items-center gap-1 text-xs font-medium px-2.5 h-8 rounded-md border border-border bg-card hover:bg-slate-50 text-text transition-colors shadow-xs disabled:opacity-50"
                      title="Re-crawl URL to verify fix"
                    >
                      <RefreshCw className={`w-3 h-3 text-primary ${verifyingTaskId === task.id ? 'animate-spin' : ''}`} />
                      <span>{verifyingTaskId === task.id ? 'Verifying...' : 'Verify Fix Now'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold font-head text-text">{task.title}</h3>
                  <p className="text-xs text-muted mt-1 leading-relaxed">{task.description}</p>
                  <p className="text-xs font-mono text-muted mt-1 truncate">
                    Target: {task.affectedUrl}
                  </p>
                </div>

                {/* Steps Box */}
                <div className="p-3.5 rounded-lg bg-bg border border-border text-xs space-y-1.5">
                  <p className="font-semibold text-text font-head">Recommended Implementation Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted pl-1">
                    {task.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Status Action Bar */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted">Status:</span>
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs font-medium px-2.5 h-8 rounded-lg border border-border bg-card text-text outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>

                  <div className="text-[11px] text-muted flex items-center gap-3">
                    <span>Due: {task.dueDate || 'Unscheduled'}</span>
                    <span className="text-border">•</span>
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              /* Empty state: friendly icon, one-line explanation, one clear action button */
              <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border shadow-card space-y-3">
                <CheckSquare className="w-10 h-10 text-muted mx-auto" />
                <p className="text-sm font-medium text-text">No action items match the selected filter.</p>
                <p className="text-xs text-muted">Clear your filter criteria or create a new custom task.</p>
                <div className="pt-2">
                  <button
                    onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); }}
                    className="px-4 h-10 rounded-md border border-border bg-card hover:bg-slate-50 text-text font-medium text-xs shadow-xs"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Agent Chat & Reasoning Panel (Section 5 Compliant) */}
          {isAgentPanelOpen && (
            <div className="bg-card rounded-lg border border-border shadow-card p-4 flex flex-col h-[740px] sticky top-20 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-xs border border-blue-200">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold font-head text-text">RankPilot AI Agent</h3>
                    <p className="text-[10px] text-muted">Evidence reasoning engine</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAgentPanelOpen(false)}
                  className="text-muted hover:text-text p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {msg.sender === 'user' ? (
                      /* User message: green-tint bubble aligned right */
                      <div className="flex justify-end">
                        <div className="bg-primary-tint border border-emerald-200/80 text-text rounded-lg rounded-tr-xs p-3 text-xs max-w-[85%] shadow-xs leading-relaxed">
                          {msg.text}
                          <span className="text-[10px] font-mono text-primary/70 block mt-1 text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Agent reply: white card with 1px border and blue Agent avatar on left */
                      <div className="flex items-start gap-2 max-w-[95%]">
                        <div className="w-6 h-6 rounded-full bg-accent-tint text-accent flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200 mt-1">
                          AI
                        </div>
                        <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-card space-y-2.5 text-text leading-relaxed w-full">
                          <p>{msg.text}</p>

                          {/* Task steps vertical timeline */}
                          {msg.steps && (
                            <div className="space-y-1.5 pt-1 border-t border-border">
                              <p className="text-[10px] font-semibold text-muted uppercase tracking-wider font-head">
                                Agent Execution Steps
                              </p>
                              <div className="space-y-1.5 pl-1">
                                {msg.steps.map((step, idx) => (
                                  <div key={idx} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      {step.status === 'done' ? (
                                        <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                                      ) : step.status === 'running' ? (
                                        <RefreshCw className="w-3.5 h-3.5 text-accent animate-spin shrink-0" />
                                      ) : step.status === 'failed' ? (
                                        <XCircle className="w-3.5 h-3.5 text-error shrink-0" />
                                      ) : (
                                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                                      )}
                                      <span className="font-sans text-xs text-text">{step.title}</span>
                                    </div>
                                    <span className="font-mono text-[10px] text-muted">{step.timing}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Agent Log Collapsible Block */}
                          {msg.logs && (
                            <div className="pt-1">
                              <button
                                onClick={() => setIsLogsOpen(!isLogsOpen)}
                                className="flex items-center gap-1 text-[10px] font-mono text-muted hover:text-text"
                              >
                                <Terminal className="w-3 h-3" />
                                <span>{isLogsOpen ? 'Hide execution log' : 'View execution log'}</span>
                              </button>
                              {isLogsOpen && (
                                <div className="mt-1.5 p-2.5 rounded-md bg-[#F1F5F9] dark:bg-slate-800 border border-border font-mono text-[11px] text-slate-700 dark:text-slate-300 space-y-1 overflow-x-auto max-h-32">
                                  {msg.logs.map((log, lIdx) => (
                                    <div key={lIdx}>{log}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <span className="text-[10px] font-mono text-muted block text-right">
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Thinking State: 3 soft blue pulsing dots */}
                {isAnalyzing && (
                  <div className="flex items-center gap-2 pl-8 text-xs text-accent">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse delay-75"></span>
                      <span className="w-2 h-2 rounded-full bg-accent animate-pulse delay-150"></span>
                    </span>
                    <span className="font-medium text-xs">Agent is analyzing…</span>
                  </div>
                )}
              </div>

              {/* Beginner Prompt Chips */}
              <div className="pt-2 border-t border-border flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setChatInput('Find top striking distance keyword opportunities')}
                  className="px-2 py-1 rounded-sm bg-bg border border-border text-[10px] text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Striking distance queries
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput('Check missing Schema.org JSON-LD code')}
                  className="px-2 py-1 rounded-sm bg-bg border border-border text-[10px] text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Generate Schema code
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput('Diagnose recent organic traffic changes')}
                  className="px-2 py-1 rounded-sm bg-bg border border-border text-[10px] text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Analyze traffic drop
                </button>
                <button
                  type="button"
                  onClick={() => setChatInput('Draft client report executive summary')}
                  className="px-2 py-1 rounded-sm bg-bg border border-border text-[10px] text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Draft report summary
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="pt-1 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask agent to diagnose or craft fixes..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="w-10 h-10 rounded-md bg-card hover:bg-slate-50 border border-border text-accent flex items-center justify-center shadow-xs disabled:opacity-40 transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Task Modal: 16px radius, --shadow-pop */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border max-w-md w-full p-6 shadow-pop animate-in fade-in space-y-4">
            <h3 className="text-base font-bold font-head text-text">Add Custom SEO Action Task</h3>
            <p className="text-xs text-muted">
              Create an agency action task for your team or client development roadmap.
            </p>

            <form onSubmit={handleCreateManualTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-text block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Article Schema on Blog Post"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Affected URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/blog/post"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FindingCategory)}
                    className="w-full text-xs px-2.5 h-10 rounded-md border border-border bg-card text-text outline-none"
                  >
                    <option value="technical">Technical</option>
                    <option value="content">Content</option>
                    <option value="geo">GEO</option>
                    <option value="aeo">AEO</option>
                    <option value="indexability">Indexability</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-text block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-2.5 h-10 rounded-md border border-border bg-card text-text outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs px-3 h-10 rounded-md border border-border bg-card text-text outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 h-10 text-xs font-medium text-muted hover:text-text rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 h-10 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-md shadow-xs"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
