import React from 'react';

/**
 * Skeleton loading placeholder.
 *
 * @param {string} className - Additional CSS classes for sizing
 * @param {boolean} rounded - Use rounded-full for circular skeletons
 */
const Skeleton = ({ className = '', rounded = false }) => {
  return (
    <div
      className={`skeleton ${rounded ? 'rounded-full' : 'rounded'} ${className}`}
      aria-hidden="true"
    />
  );
};

export default Skeleton;
