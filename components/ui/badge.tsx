import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    success: 'bg-primary-tint text-primary border border-emerald-200/80 dark:border-emerald-900/50',
    warning: 'bg-amber-50 dark:bg-amber-950/40 text-warning border border-amber-200 dark:border-amber-900/50',
    error: 'bg-red-50 dark:bg-red-950/40 text-error border border-red-200 dark:border-red-900/50',
    info: 'bg-accent-tint text-accent border border-blue-200/80 dark:border-blue-900/50',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-muted border border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
