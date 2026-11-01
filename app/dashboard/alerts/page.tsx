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
    <div>
      <DashboardHeader
        title="Alerts & Notification Center"
        subtitle="Automated in-app alerts for critical audit breakages, 28-day traffic drops and verified task fixes"
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-surface-border shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-surface-muted">Filter:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-bg outline-none"
            >
              <option value="all">All Alerts ({notifications.length})</option>
              <option value="critical">Critical Only</option>
              <option value="warning">Warnings / Drops</option>
              <option value="success">Verifications & Syncs</option>
            </select>
            {unreadCount > 0 && (
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>

          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-border bg-white transition-colors self-start sm:self-auto"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-5 rounded-xl border transition-all flex items-start gap-4 ${
                notif.isRead
                  ? 'bg-white border-surface-border opacity-85'
                  : 'bg-white border-indigo-200 ring-1 ring-indigo-50 shadow-sm'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.severity === 'critical' ? (
                  <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center text-status-error">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                ) : notif.severity === 'warning' ? (
                  <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-status-warning">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-xs font-bold ${notif.isRead ? 'text-navy' : 'text-indigo-950 font-extrabold'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[11px] text-surface-muted shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-surface-muted leading-relaxed">{notif.message}</p>

                <div className="pt-2 flex items-center gap-4">
                  {notif.linkUrl && (
                    <Link
                      href={notif.linkUrl}
                      className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1"
                    >
                      View Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-xs text-surface-muted hover:text-navy"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-surface-border">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-navy">No alerts match the selected filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
