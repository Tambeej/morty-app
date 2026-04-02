/**
 * Progress Bar Component
 */

import React from 'react';

/**
 * @param {number} value - Progress value (0-100)
 * @param {string} label - Accessible label
 * @param {boolean} showLabel - Show percentage text
 */
const ProgressBar = ({ value = 0, label = 'Progress', showLabel = false, className = '' }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-xs text-[#94a3b8]">{label}</span>
          <span className="text-xs text-[#94a3b8]">{clampedValue}%</span>
        </div>
      )}
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="progress-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
