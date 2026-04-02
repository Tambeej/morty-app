/**
 * Spinner Component
 * Loading indicator with configurable size
 */

import React from 'react';

/**
 * @param {'sm'|'md'|'lg'} size - Spinner size
 * @param {string} className - Additional CSS classes
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        border-gold border-t-transparent
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;
