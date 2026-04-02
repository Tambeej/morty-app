/**
 * Card Component
 * Reusable card container with optional hover effects
 */

import React from 'react';

/**
 * @param {Object} props
 * @param {boolean} props.interactive - Enable hover effects
 * @param {boolean} props.goldTop - Add gold top border (analysis card style)
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children
 */
const Card = ({
  interactive = false,
  goldTop = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <div
      className={`
        bg-navy-surface border border-border rounded-card p-6 shadow-card
        ${interactive ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer' : ''}
        ${goldTop ? 'border-t-4 border-t-gold' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
