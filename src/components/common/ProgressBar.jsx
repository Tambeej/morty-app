import React from 'react';
import PropTypes from 'prop-types';

/**
 * Horizontal progress bar with gold gradient fill.
 * @param {number} value - 0 to 100
 * @param {string} label - Accessible label
 */
export default function ProgressBar({ value = 0, label = '', className = '' }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={`progress-bar ${className}`} role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="progress-fill" style={{ width: `${clamped}%` }} />
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string
};
