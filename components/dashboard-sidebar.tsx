'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutDashboard,
  Globe,
  FileSearch,
  Search,
  Sparkles,
  TrendingDown,
  CheckSquare,
  Bell,
  FileText,
  ShieldCheck,
  Settings,
  Building2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Websites', href: '/dashboard/websites', icon: Globe },
  { name: 'Audits', href: '/dashboard/audits', icon: FileSearch },
  { name: 'Search Console', href: '/dashboard/gsc', icon: Search },
  { name: 'Opportunities', href: '/dashboard/opportunities', icon: Sparkles },
  { name: 'Traffic Analysis', href: '/dashboard/traffic', icon: TrendingDown },
  { name: 'Action Center', href: '/dashboard/action-center', icon: CheckSquare, badge: 3 },
  { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: 2 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Trust Center', href: '/dashboard/trust-center', icon: ShieldCheck },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const org = storage.getOrganization();
  const user = storage.getUser();

  return (
    <aside className="w-64 bg-navy border-r border-slate-800 flex flex-col shrink-0 min-h-screen text-slate-300">
      {/* Brand & Organization Header */}
      <div className="p-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">RankPilot <span className="text-indigo-400">AI</span></span>
        </Link>

        {/* Organization Switcher Pill */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="font-medium text-white truncate">{org.name}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 px-3 py-2">
          Agency Workspace
        </div>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white font-semibold"
                  : "text-slate-300 hover:text-white hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white text-indigo-700" : "bg-indigo-950 text-indigo-300 border border-indigo-700/50"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-black/20">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xs font-bold text-indigo-300">
            {user.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
