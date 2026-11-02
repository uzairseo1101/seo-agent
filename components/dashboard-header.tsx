'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Plus, Globe, Moon, Sun } from 'lucide-react';
import { storage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { Website } from '@/lib/types';

export default function DashboardHeader({
  title,
  subtitle,
  actionButton,
}: {
  title: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}) {
  const [websites, setWebsites] = useState<Website[]>(() => {
    return storage.getWebsites().filter(
      (w) =>
        !['web-1', 'web-2', 'web-3'].includes(w.id) &&
        !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
    );
  });
  const [selectedWeb, setSelectedWeb] = useState(websites[0]?.id || '');
  const notifications = storage.getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDarkMode =
        document.documentElement.classList.contains('dark') ||
        localStorage.getItem('theme') === 'dark';
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadWebsites = async () => {
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
            const clean = data.websites.filter(
              (w: Website) =>
                !['web-1', 'web-2', 'web-3'].includes(w.id) &&
                !['SaaSFlow Analytics', 'Nordic Clean Living', 'Zenith Legal Partners'].includes(w.name)
            );
            setWebsites(clean);
            if (clean.length > 0 && !selectedWeb) {
              setSelectedWeb(clean[0].id);
            }
          }
        }
      } catch {
        // Silently use current state
      }
    };
    loadWebsites();
    return () => {
      mounted = false;
    };
  }, [selectedWeb]);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 transition-colors">
      <div className="flex flex-col justify-center">
        <h1 className="text-xl sm:text-2xl font-bold font-head text-text tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-muted mt-1 truncate">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Website Selector (when websites are connected) */}
        {websites.length > 0 && (
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-md text-xs font-medium text-text h-10 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
            <Globe className="w-3.5 h-3.5 text-muted shrink-0" />
            <select
              value={selectedWeb}
              onChange={(e) => setSelectedWeb(e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-text"
            >
              {websites.map((w) => (
                <option key={w.id} value={w.id} className="bg-card text-text">
                  {w.name} ({w.domain})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center text-muted hover:text-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Bell */}
        <Link
          href="/dashboard/alerts"
          className="relative w-10 h-10 rounded-md border border-border bg-card flex items-center justify-center text-muted hover:text-text hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-card"></span>
          )}
        </Link>

        {/* Header Action Button (if provided or default secondary Run Audit) */}
        {actionButton ? (
          actionButton
        ) : (
          <Link
            href="/dashboard/audits"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text bg-card hover:bg-slate-50 dark:hover:bg-slate-800 border border-border px-3.5 h-10 rounded-md shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-muted" />
            <span>New Audit</span>
          </Link>
        )}
      </div>
    </header>
  );
}
