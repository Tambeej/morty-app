/**
 * ProgressBar Component
 * Animated progress indicator
 */
import React from 'react';

/**
 * @param {number} value - 0 to 100
 * @param {string} className
 * @param {string} label
 */
function ProgressBar({ value = 0, className = '', label }) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-text-secondary">{label}</span>
          <span className="text-xs text-gold font-medium">{clampedValue}%</span>
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
        <div
          className="progress-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
