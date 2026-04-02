import React from 'react';
import PropTypes from 'prop-types';

/**
 * Card component — surface container with optional hover effect.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {boolean} [props.interactive] - enables hover lift effect
 * @param {string} [props.goldTopBorder] - adds gold top border (analysis card style)
 */
const Card = ({ children, className = '', interactive = false, goldTopBorder = false }) => {
  const base =
    'bg-navy-surface border border-border rounded-card p-6 shadow-card';
  const hover = interactive
    ? 'transition-transform duration-200 hover:-translate-y-0.5 hover:border-gold cursor-pointer'
    : '';
  const topBorder = goldTopBorder ? 'border-t-4 border-t-gold' : '';

  return (
    <div className={`${base} ${hover} ${topBorder} ${className}`}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  interactive: PropTypes.bool,
  goldTopBorder: PropTypes.bool,
};

export default Card;
