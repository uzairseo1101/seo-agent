'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  RefreshCw,
  Search,
  Clock,
  Shield,
  Layers,
  Code
} from 'lucide-react';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/logs?limit=100');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.logs) {
          setLogs(json.logs);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.entity_id && l.entity_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-head text-text">Security & Operational Activity Logs</h1>
          <p className="text-xs text-muted mt-1">
            Immutable audit trail tracking account creations, permission changes, website modifications, and audits
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-card hover:bg-slate-50 border border-border text-text rounded-md text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Filter logs by action keyword, entity type, or entity ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-9 pr-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:border-primary"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-lg border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg border-b border-border text-[11px] font-semibold text-muted font-sans uppercase">
              <tr>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity Type</th>
                <th className="px-5 py-3.5">Entity ID</th>
                <th className="px-5 py-3.5">Metadata Snapshot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-muted">
                    No activity records found.
                  </td>
                </tr>
              ) : (
                filtered.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-4 font-mono font-bold text-text">
                      <span className="text-[10px] px-2 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-border">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-medium text-text">
                      {log.entity_type}
                    </td>
                    <td className="px-5 py-4 font-mono text-muted text-[11px]">
                      {log.entity_id || '—'}
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
