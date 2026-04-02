import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProgressBar component — horizontal progress indicator.
 * @param {object} props
 * @param {number} props.value - 0 to 100
 * @param {string} [props.label]
 * @param {string} [props.className]
 */
const ProgressBar = ({ value, label, className = '' }) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {label}
          </span>
          <span className="text-xs font-semibold text-gold">{clamped}%</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};

ProgressBar.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default ProgressBar;
