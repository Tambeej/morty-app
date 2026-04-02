import React from 'react';

/**
 * ProgressBar component
 * Displays a progress bar with optional label and percentage.
 *
 * @param {number} value - Progress value (0-100)
 * @param {string} [label] - Optional label text
 * @param {boolean} [showPercent=true] - Whether to show percentage text
 * @param {string} [className] - Additional CSS classes
 * @param {'sm'|'md'|'lg'} [size='md'] - Bar height size
 * @param {'gold'|'success'|'error'|'info'} [color='gold'] - Bar color variant
 */
const ProgressBar = ({
  value = 0,
  label,
  showPercent = true,
  className = '',
  size = 'md',
  color = 'gold',
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heightMap = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2.5',
  };

  const colorMap = {
    gold: 'from-amber-500 to-amber-400',
    success: 'from-emerald-500 to-emerald-400',
    error: 'from-red-500 to-red-400',
    info: 'from-blue-500 to-blue-400',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium text-slate-400">{label}</span>
          )}
          {showPercent && (
            <span className="text-xs font-semibold text-amber-400 ml-auto">
              {clampedValue}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-700 rounded-full overflow-hidden ${heightMap[size]}`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`h-full bg-gradient-to-r ${colorMap[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
