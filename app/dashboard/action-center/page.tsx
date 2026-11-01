'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { ActionItem, TaskPriority, TaskStatus } from '@/lib/types';
import {
  CheckSquare,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Plus
} from 'lucide-react';

export default function ActionCenterPage() {
  const [tasks, setTasks] = useState<ActionItem[]>(storage.getActionItems());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<ActionItem | null>(null);

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    storage.updateActionItemStatus(id, newStatus);
    setTasks([...storage.getActionItems()]);
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
        {/* Top Filters & Stats Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3">
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

          <div className="text-xs text-surface-muted">
            Showing <strong className="text-navy">{filteredTasks.length}</strong> tasks
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
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-surface-muted uppercase">{task.category}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-surface-muted capitalize">Source: {task.sourceType.replace('_', ' ')}</span>
                </div>

                {/* Verification Outcome Badge */}
                <div className="flex items-center gap-2">
                  {task.verificationStatus === 'completed_verified' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed — Verified
                    </span>
                  )}
                  {task.verificationStatus === 'unverified' && task.status === 'completed' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      <Clock className="w-3.5 h-3.5" /> Awaiting Re-Audit Verification
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-navy">{task.title}</h3>
                <p className="text-xs text-surface-muted mt-0.5">{task.description}</p>
                <p className="text-xs font-mono text-slate-500 mt-1">Affected URL: {task.affectedUrl}</p>
              </div>

              {/* Recommended steps */}
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
                  <span className="text-xs font-semibold text-navy">Task Status:</span>
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

                <div className="text-[11px] text-surface-muted">
                  Due: {task.dueDate || 'Unscheduled'} • Created: {new Date(task.createdAt).toLocaleDateString()}
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
    </div>
  );
}
