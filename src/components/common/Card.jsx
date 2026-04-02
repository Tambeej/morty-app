import React from 'react';
import PropTypes from 'prop-types';

/**
 * Surface card component.
 *
 * @param {boolean} interactive - Adds hover lift effect
 * @param {boolean} goldTop - Adds gold top border (analysis card style)
 */
export default function Card({ children, className = '', interactive = false, goldTop = false }) {
  return (
    <div
      className={[
        'bg-navy-surface border border-border rounded-card p-6 shadow-card',
        interactive && 'transition-all duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer',
        goldTop && 'border-t-[3px] border-t-gold',
        className
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  interactive: PropTypes.bool,
  goldTop: PropTypes.bool
};
