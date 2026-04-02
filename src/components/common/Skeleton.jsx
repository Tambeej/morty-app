import React from 'react';
import PropTypes from 'prop-types';

/**
 * Shimmer skeleton placeholder.
 */
export default function Skeleton({ className = '', height = '1rem', width = '100%' }) {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  height: PropTypes.string,
  width: PropTypes.string
};
