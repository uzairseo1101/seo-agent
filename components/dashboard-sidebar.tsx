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
  Bot,
  Building2,
  ChevronDown,
  Layers,
  Users2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Websites', href: '/dashboard/websites', icon: Globe },
    ],
  },
  {
    title: 'Agent',
    items: [
      { name: 'Action Center', href: '/dashboard/action-center', icon: Bot, badge: 3 },
      { name: 'Alerts', href: '/dashboard/alerts', icon: Bell, badge: 2 },
    ],
  },
  {
    title: 'Keywords',
    items: [
      { name: 'Search Console', href: '/dashboard/gsc', icon: Search },
      { name: 'Opportunities', href: '/dashboard/opportunities', icon: Sparkles },
      { name: 'Traffic Analysis', href: '/dashboard/traffic', icon: TrendingDown },
    ],
  },
  {
    title: 'Audits',
    items: [
      { name: 'Website Audits', href: '/dashboard/audits', icon: FileSearch },
      { name: 'Trust Center', href: '/dashboard/trust-center', icon: ShieldCheck },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Content Briefs', href: '/dashboard/opportunities?tab=content', icon: FileText },
    ],
  },
  {
    title: 'Competitors',
    items: [
      { name: 'Competitors', href: '/dashboard/opportunities?tab=competitors', icon: Layers },
    ],
  },
  {
    title: 'Reports',
    items: [
      { name: 'Agency Reports', href: '/dashboard/reports', icon: FileText },
    ],
  },
  {
    title: 'Settings',
    items: [
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const org = storage.getOrganization();

  return (
    <aside className="w-[240px] bg-card border-r border-border flex flex-col shrink-0 min-h-screen text-text z-20">
      {/* Brand & Organization */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 mb-3.5 group">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-xs">
            <Compass className="w-4.5 h-4.5" />
          </div>
          <span className="font-head font-bold text-base text-text tracking-tight">
            RankPilot <span className="text-primary font-semibold">AI</span>
          </span>
        </Link>

        {/* Organization Switcher Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-bg border border-border text-xs">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
            <span className="font-medium text-text truncate">{org.name}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
        </div>
      </div>

      {/* Main Navigation Sections */}
      <nav className="flex-1 px-2.5 py-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-muted px-2.5 py-1 font-sans">
              {section.title}
            </div>
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 text-sm font-medium transition-colors rounded-sm",
                    isActive
                      ? "bg-primary-tint text-primary font-semibold border-l-[3px] border-primary pl-2"
                      : "text-muted hover:text-text hover:bg-slate-100/70"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-primary" : "text-muted")} />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full",
                        isActive
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-muted border border-border"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom Profile / Quick Info */}
      <div className="p-3 border-t border-border bg-card">
        <div className="flex items-center gap-2.5 px-1 py-1">
          <div className="w-7 h-7 rounded-full bg-accent-tint text-accent font-semibold text-xs flex items-center justify-center shrink-0 border border-blue-200">
            AG
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-text truncate">Agency Workspace</span>
            <span className="text-[10px] font-mono text-muted truncate">Local Dev Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
