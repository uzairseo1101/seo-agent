'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Search, Plus, Globe, Shield } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function DashboardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const websites = storage.getWebsites();
  const [selectedWeb, setSelectedWeb] = useState(websites[0]?.id || '');
  const notifications = storage.getNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-16 bg-white border-b border-surface-border px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-bold text-navy tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-surface-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Mock/Dev Mode Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-surface-muted font-medium">
          <Shield className="w-3 h-3 text-brand-600" />
          <span>Local Dev Mode (Safe Storage)</span>
        </div>

        {/* Website Selector */}
        {websites.length > 0 && (
          <div className="flex items-center gap-2 bg-surface-bg border border-surface-border px-3 py-1.5 rounded-lg text-xs font-medium text-surface-text">
            <Globe className="w-3.5 h-3.5 text-brand-600" />
            <select
              value={selectedWeb}
              onChange={(e) => setSelectedWeb(e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Alerts Bell */}
        <Link
          href="/dashboard/alerts"
          className="relative p-2 text-surface-muted hover:text-navy hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-error rounded-full ring-2 ring-white"></span>
          )}
        </Link>

        {/* Quick Action Button */}
        <Link
          href="/dashboard/audits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-2 rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Run New Audit</span>
        </Link>
      </div>
    </header>
  );
}
