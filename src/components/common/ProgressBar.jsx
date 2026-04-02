import React from 'react';

/**
 * ProgressBar component.
 *
 * @param {number} value - Progress value (0-100)
 * @param {string} className - Additional CSS classes
 * @param {boolean} showLabel - Show percentage label
 */
const ProgressBar = ({ value = 0, className = '', showLabel = false }) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="progress-bar flex-1" role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="progress-fill"
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-text-secondary font-medium w-10 text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
