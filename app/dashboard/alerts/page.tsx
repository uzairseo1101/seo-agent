'use client';

import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard-header';
import { storage } from '@/lib/storage';
import { AppNotification } from '@/lib/types';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  Check,
  ExternalLink,
  Trash2,
  Filter,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function AlertsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>(storage.getNotifications());
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const handleMarkAllRead = () => {
    storage.markAllNotificationsAsRead();
    setNotifications([...storage.getNotifications()]);
  };

  const handleMarkRead = (id: string) => {
    storage.markNotificationAsRead(id);
    setNotifications([...storage.getNotifications()]);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (severityFilter !== 'all' && n.severity !== severityFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Alerts & Notification Center"
        subtitle="Automated in-app alerts for critical audit breakages, 28-day traffic drops and verified task fixes"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border shadow-card">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted">Filter:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-medium px-3 h-10 rounded-md border border-border bg-card text-text outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs cursor-pointer"
            >
              <option value="all">All Alerts ({notifications.length})</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings / Drops</option>
              <option value="success">Verifications & Syncs</option>
            </select>
            {unreadCount > 0 && (
              <span className="text-xs font-mono font-medium text-primary bg-primary-tint border border-emerald-200 px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-medium text-text hover:bg-slate-50 flex items-center gap-1.5 px-3 h-10 rounded-md border border-border bg-card transition-colors shadow-xs self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5 text-primary" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-lg border transition-all flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-card border-border opacity-85 shadow-card'
                  : 'bg-card border-border border-l-4 border-l-primary shadow-pop'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.severity === 'critical' ? (
                  <div className="w-9 h-9 rounded-md bg-red-50 border border-red-200 flex items-center justify-center text-error">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                ) : notif.severity === 'warning' ? (
                  <div className="w-9 h-9 rounded-md bg-amber-50 border border-amber-200 flex items-center justify-center text-warning">
                    <TrendingDown className="w-4.5 h-4.5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-md bg-primary-tint border border-emerald-200 flex items-center justify-center text-primary">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold font-head text-text truncate">{notif.title}</h4>
                  <span className="text-[11px] font-mono text-muted shrink-0">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-muted mt-1 leading-relaxed">{notif.message}</p>

                <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="text-accent hover:underline flex items-center gap-1 font-medium font-sans"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-muted hover:text-text font-medium font-sans"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border shadow-card space-y-3">
              <Bell className="w-10 h-10 text-muted mx-auto" />
              <p className="text-sm font-medium text-text">No notifications to display.</p>
              <p className="text-xs text-muted">You are completely up to date.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
