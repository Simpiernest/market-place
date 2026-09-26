'use client';

import * as React from 'react';
import { cn } from '../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse rounded-xl bg-muted/60',
        className
      )}
      {...props}
    />
  )
);
Skeleton.displayName = 'Skeleton';

export { Skeleton };