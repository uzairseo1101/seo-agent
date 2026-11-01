'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
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
  Check
} from 'lucide-react';

export default function ActionCenterPage() {
  const [tasks, setTasks] = useState<ActionItem[]>(storage.getActionItems());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Modals & Active task inspection
  const [selectedTask, setSelectedTask] = useState<ActionItem | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<{
    taskId: string;
    outcome: string;
    explanation: string;
    afterEvidence: string;
  } | null>(null);

  // New task form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<FindingCategory>('technical');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  const handleStatusChange = async (id: string, newStatus: TaskStatus) => {
    storage.updateActionItemStatus(id, newStatus);
    setTasks([...storage.getActionItems()]);
  };

  const handleVerifyTask = async (taskId: string) => {
    setVerifyingTaskId(taskId);
    setVerificationFeedback(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification re-check failed.');
      }

      setTasks([...storage.getActionItems()]);
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

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        affectedUrl: newUrl,
        category: newCategory,
        priority: newPriority,
        dueDate: newDueDate,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setTasks([...storage.getActionItems()]);
      setIsNewTaskModalOpen(false);
      setNewTitle('');
      setNewUrl('');
      setNewDueDate('');
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div>
      <DashboardHeader
        title="SEO Action Center & Verification"
        subtitle="Turn audit issues and GSC opportunities into prioritized work, then verify fixes via automated re-audits"
      />

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Verification Result Feedback Modal / Card */}
        {verificationFeedback && (
          <div className="p-4 rounded-xl bg-white border-2 border-indigo-200 shadow-md animate-in fade-in space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {verificationFeedback.outcome === 'completed_verified' ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Completed — Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Still Unresolved
                  </span>
                )}
                <span className="text-xs font-bold text-navy">Re-Crawl Verification Result</span>
              </div>
              <button
                onClick={() => setVerificationFeedback(null)}
                className="text-slate-400 hover:text-navy text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-surface-muted leading-relaxed">
              {verificationFeedback.explanation}
            </p>
            <div className="p-2.5 rounded bg-surface-bg border border-surface-border font-mono text-[11px] text-slate-700">
              Evidence captured: {verificationFeedback.afterEvidence}
            </div>
          </div>
        )}

        {/* Top Header & Actions Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-muted">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
              >
                <option value="all">All Statuses ({tasks.length})</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-surface-muted">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
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
            <span className="text-xs text-surface-muted hidden sm:inline">
              Showing <strong className="text-navy">{filteredTasks.length}</strong> tasks
            </span>
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Task</span>
            </button>
          </div>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-surface-border p-5 shadow-sm hover:shadow-md transition-shadow space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs font-bold text-surface-muted uppercase">{task.category}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-surface-muted capitalize">Source: {task.sourceType.replace('_', ' ')}</span>
                </div>

                {/* Verification Outcome Badge & Verification Trigger */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {task.verificationStatus === 'completed_verified' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed — Verified
                    </span>
                  ) : task.verificationStatus === 'still_unresolved' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                      Still Unresolved
                    </span>
                  ) : task.status === 'completed' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Re-Audit
                    </span>
                  ) : null}

                  {/* 1-Click Verification Trigger Button */}
                  <button
                    onClick={() => handleVerifyTask(task.id)}
                    disabled={verifyingTaskId === task.id}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md border border-surface-border text-navy hover:bg-slate-50 transition-colors disabled:opacity-50"
                    title="Re-crawl URL to verify fix"
                  >
                    <RefreshCw className={`w-3 h-3 text-brand-600 ${verifyingTaskId === task.id ? 'animate-spin' : ''}`} />
                    <span>{verifyingTaskId === task.id ? 'Verifying...' : 'Verify Fix Now'}</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-navy">{task.title}</h3>
                <p className="text-xs text-surface-muted mt-0.5">{task.description}</p>
                <p className="text-xs font-mono text-slate-500 mt-1 truncate">
                  Target URL: {task.affectedUrl}
                </p>
              </div>

              {/* Steps Box */}
              <div className="p-3.5 rounded-lg bg-surface-bg border border-surface-border text-xs space-y-1.5">
                <p className="font-semibold text-navy">Recommended Implementation Steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                  {task.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Status Action Bar */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-surface-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-navy">Status:</span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-surface-border bg-white outline-none cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>

                <div className="text-[11px] text-surface-muted flex items-center gap-3">
                  <span>Due: {task.dueDate || 'Unscheduled'}</span>
                  <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredTasks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-surface-border">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-navy">No tasks match the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Custom Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-surface-border max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 space-y-4">
            <h3 className="text-base font-bold text-navy">Add Custom SEO Action Task</h3>
            <p className="text-xs text-surface-muted">
              Create an agency action task for your team or client development roadmap.
            </p>

            <form onSubmit={handleCreateManualTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement Article Schema on Blog Post"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Affected URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/blog/post"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none focus:border-brand-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FindingCategory)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white outline-none"
                  >
                    <option value="technical">Technical</option>
                    <option value="content">Content</option>
                    <option value="geo">GEO</option>
                    <option value="aeo">AEO</option>
                    <option value="indexability">Indexability</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-navy block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border bg-white outline-none"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-navy block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-surface-border outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-surface-muted hover:text-navy rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm"
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
