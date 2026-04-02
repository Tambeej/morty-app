import React from 'react';
import { clsx } from 'clsx';

export default function ProgressBar({ value, label, showLabel = false, className }) {
  const clampedValue = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400">{label}</span>
          <span className="text-xs font-medium text-gold">{clampedValue}%</span>
        </div>
      )}
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div className="progress-fill" style={{ width: `${clampedValue}%` }} />
      </div>
    </div>
  );
}
