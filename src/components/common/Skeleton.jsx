/**
 * Skeleton Component
 * Loading placeholder with shimmer animation
 */
import React from 'react';

/**
 * @param {string} className
 * @param {string} width
 * @param {string} height
 */
function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
