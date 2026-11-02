'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Globe,
  FileSearch,
  CheckSquare,
  Search,
  Sparkles,
  FileText,
  Settings,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mainNavItems: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Websites', href: '/dashboard/websites', icon: Globe },
  { name: 'Audits & Crawler', href: '/dashboard/audits', icon: FileSearch },
  { name: 'Action Center', href: '/dashboard/action-center', icon: CheckSquare },
  { name: 'Search Console', href: '/dashboard/gsc', icon: Search },
  { name: 'Opportunities', href: '/dashboard/opportunities', icon: Sparkles },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
];

const workspaceNavItems: NavItem[] = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Trust Center', href: '/dashboard/trust-center', icon: ShieldCheck },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userFullName, setUserFullName] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const client = supabase;
    if (client) {
      client.auth.getUser().then(({ data }) => {
        if (data?.user?.email && mounted) {
          const email = data.user.email;
          setUserEmail(email);
          setUserFullName(data.user.user_metadata?.full_name || email.split('@')[0] || 'User');

          const isFounder =
            email === 'founder@rankpilot.ai' ||
            email.endsWith('@uzairseo.com') ||
            email.includes('uzairnoor');

          if (isFounder) {
            setIsAdmin(true);
          } else if (client) {
            // Check role from profiles
            client
              .from('profiles')
              .select('role')
              .eq('id', data.user.id)
              .maybeSingle()
              .then(({ data: prof }) => {
                if (mounted && (prof?.role === 'admin' || prof?.role === 'superadmin')) {
                  setIsAdmin(true);
                }
              });
          }
        }
      });
    }
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Sign out error:', e);
    }

    if (typeof window !== 'undefined') {
      // Purge all user workspace keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('rankpilot_') || key.startsWith('rp_')) {
          localStorage.removeItem(key);
        }
      });
    }

    router.push('/signin');
  };

  return (
    <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0 min-h-screen text-text z-20 transition-colors">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-xs group-hover:bg-primary-hover transition-colors">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <span className="font-head font-bold text-base text-text tracking-tight">
            RankPilot <span className="text-primary font-semibold">AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-muted/70">
            Platform
          </div>
          {mainNavItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary-tint text-primary font-semibold"
                    : "text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Workspace Section */}
        <div className="space-y-1">
          <div className="px-3 pb-1.5 text-[11px] font-semibold tracking-wider uppercase text-muted/70">
            Workspace
          </div>
          {workspaceNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all",
                  isActive
                    ? "bg-primary-tint text-primary font-semibold"
                    : "text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800/60"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all",
                pathname.startsWith('/admin')
                  ? "bg-primary-tint text-primary font-semibold"
                  : "text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Admin Console</span>
            </Link>
          )}
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-border bg-card">
        <div className="p-2 rounded-md bg-bg border border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-primary-tint text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-900/50">
              {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-text truncate">
                {userFullName || (userEmail ? userEmail.split('@')[0] : 'User')}
              </span>
              <span className="text-[10px] text-muted truncate">
                {userEmail || 'Active'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
