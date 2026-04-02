import React from 'react';
import { clsx } from 'clsx';

export default function Card({ interactive = false, goldTop = false, className, children, ...props }) {
  return (
    <div
      className={clsx(
        'bg-navy-surface border border-border rounded-card p-6 shadow-card',
        interactive && 'transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-gold',
        goldTop && 'border-t-[3px] border-t-gold',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
