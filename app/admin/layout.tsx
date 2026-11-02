'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Compass,
  Users,
  Globe,
  FileSearch,
  Activity,
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  Server,
  Lock,
  ChevronRight,
  Database,
  LogOut
} from 'lucide-react';
import AuthGuard from '@/components/auth-guard';
import { supabase } from '@/lib/supabase';

const ADMIN_NAV = [
  { name: 'Platform Overview', href: '/admin', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Client Websites', href: '/admin/websites', icon: Globe },
  { name: 'Audit Monitoring', href: '/admin/audits', icon: FileSearch },
  { name: 'Activity & Audit Trail', href: '/admin/logs', icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/signin');
  };

  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex h-screen overflow-hidden bg-bg text-text">
        {/* Admin Sidebar */}
        <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 select-none">
          <div>
            {/* Logo */}
            <div className="h-16 px-6 border-b border-border flex items-center justify-between">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="font-head font-bold text-sm tracking-tight text-text block leading-none">
                    RankPilot <span className="text-primary font-semibold">Admin</span>
                  </span>
                  <span className="text-[10px] text-muted font-mono block mt-1">Superadmin Console</span>
                </div>
              </Link>
            </div>

            {/* Nav Items */}
            <nav className="p-3 space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold text-muted uppercase tracking-wider font-mono">
                Administration
              </div>
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-tint text-primary font-semibold border border-emerald-200 dark:border-emerald-900/40'
                        : 'text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer / Back to App & Logout */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-border flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-muted">Database:</span>
              </div>
              <span className="text-primary font-bold">Supabase PostgreSQL</span>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted hover:text-text hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-md transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to User Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 px-8 border-b border-border bg-card flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Admin Authorization Active
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted hover:text-error hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
