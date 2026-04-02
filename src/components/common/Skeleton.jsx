import React from 'react';
import { clsx } from 'clsx';

export default function Skeleton({ className, variant = 'rect' }) {
  return (
    <div
      className={clsx(
        'bg-navy-elevated animate-shimmer bg-gradient-to-r from-navy-elevated via-navy-surface to-navy-elevated bg-[length:200%_100%]',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded h-4',
        variant === 'rect' && 'rounded-card',
        className
      )}
      aria-hidden="true"
    />
  );
}
