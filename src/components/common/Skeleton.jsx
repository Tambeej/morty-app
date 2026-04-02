/**
 * Skeleton - Shimmer placeholder for loading states.
 */
import React from 'react';
import PropTypes from 'prop-types';

export default function Skeleton({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
};
