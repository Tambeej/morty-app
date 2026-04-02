/**
 * Skeleton Loading Component
 * Displays shimmer placeholder while content loads
 */

import React from 'react';

/**
 * @param {string} className - CSS classes for sizing
 */
const Skeleton = ({ className = '' }) => (
  <div
    className={`shimmer rounded ${className}`}
    aria-hidden="true"
  />
);

/**
 * Skeleton Card - full card placeholder
 */
export const SkeletonCard = () => (
  <div className="bg-navy-surface border border-border rounded-card p-6">
    <Skeleton className="h-4 w-1/3 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

/**
 * Skeleton Table Row
 */
export const SkeletonRow = ({ cols = 5 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export default Skeleton;
