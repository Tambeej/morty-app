import React from 'react';

/**
 * Card component following Morty design system.
 *
 * @param {string} className - Additional CSS classes
 * @param {boolean} interactive - Enable hover effects
 * @param {boolean} goldTopBorder - Add gold top border (for analysis cards)
 * @param {React.ReactNode} children - Card content
 */
const Card = ({ className = '', interactive = false, goldTopBorder = false, children, ...props }) => {
  return (
    <div
      className={[
        'bg-navy-surface border border-border rounded-card p-6 shadow-card',
        interactive && 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold',
        goldTopBorder && 'border-t-4 border-t-gold',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
