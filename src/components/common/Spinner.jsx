import React from 'react';
import { clsx } from 'clsx';

export default function Spinner({ size = 'md', className }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-4' };
  return (
    <div
      className={clsx('rounded-full border-navy-elevated border-t-gold animate-spin-fast', sizes[size], className)}
      role="status"
      aria-label="Loading"
    />
  );
}
