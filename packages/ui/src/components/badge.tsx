'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest transition-colors',
        {
          'border-transparent bg-primary text-primary-foreground shadow-sm': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'text-foreground': variant === 'outline',
          'border-transparent bg-destructive text-destructive-foreground shadow-sm': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = 'Badge';

export { Badge };