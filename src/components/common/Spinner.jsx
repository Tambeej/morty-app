import React from 'react';
import PropTypes from 'prop-types';

/**
 * Spinner component — animated loading indicator.
 * @param {object} props
 * @param {string} [props.size] - 'sm' | 'md' | 'lg'
 * @param {string} [props.className]
 */
const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={`${sizes[size]} rounded-full border-gold border-t-transparent animate-spin ${className}`}
    />
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default Spinner;
