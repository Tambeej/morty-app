/**
 * Spinner Component
 * Loading indicator
 */
import React from 'react';

/**
 * @param {'sm'|'md'|'lg'} size
 * @param {string} className
 */
function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-2',
  };

  return (
    <div
      className={`
        ${sizes[size] || sizes.md}
        border-border border-t-gold rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
