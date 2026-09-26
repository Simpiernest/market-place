'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'success' | 'warning';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative w-full rounded-xl border-2 p-4',
        {
          'bg-background text-foreground border-secondary': variant === 'default',
          'border-destructive/50 text-destructive bg-destructive/10': variant === 'destructive',
          'border-green-500/50 text-green-700 bg-green-500/10': variant === 'success',
          'border-yellow-500/50 text-yellow-700 bg-yellow-500/10': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  )
);
Alert.displayName = 'Alert';

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-black text-sm uppercase tracking-wide', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AlertDescription = React.forwardRef<HTMLParagraphElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm font-medium [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };