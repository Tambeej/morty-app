import React from 'react';
import PropTypes from 'prop-types';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]'
};

/**
 * Gold spinning loader.
 * @param {'sm'|'md'|'lg'} size
 */
export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-gold border-t-transparent animate-spin ${sizes[size]} ${className}`}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};
