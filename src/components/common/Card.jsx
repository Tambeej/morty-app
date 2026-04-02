/**
 * Card Component
 * Surface container with optional hover effect
 */
import React from 'react';

/**
 * @param {Object} props
 * @param {boolean} props.interactive - Enable hover effect
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
function Card({ interactive = false, className = '', children, ...rest }) {
  return (
    <div
      className={`
        bg-navy-surface border border-border rounded-card p-6 shadow-card
        ${interactive ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer' : ''}
        ${className}
      `}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
