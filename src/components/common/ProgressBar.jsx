/**
 * ProgressBar - Animated progress indicator.
 */
import React from 'react';
import PropTypes from 'prop-types';

export default function ProgressBar({ value = 0, max = 100, label, showPercent = false }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm" style={{ color: '#94a3b8' }}>
              {label}
            </span>
          )}
          {showPercent && (
            <span className="text-sm" style={{ color: '#94a3b8' }}>
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className="progress-bar"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  label: PropTypes.string,
  showPercent: PropTypes.bool,
};
