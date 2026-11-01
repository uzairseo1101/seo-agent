import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary: 'bg-primary hover:bg-primary-hover text-white shadow-xs',
      secondary: 'bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-text border border-border shadow-xs',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-text',
      danger: 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-error border border-red-200 dark:border-red-900/60',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-sm gap-1.5',
      md: 'h-10 px-4 text-xs rounded-md gap-2',
      lg: 'h-12 px-6 text-sm rounded-md gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
