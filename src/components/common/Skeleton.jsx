import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton component — shimmer placeholder for loading states.
 * @param {object} props
 * @param {string} [props.className]
 * @param {string} [props.width]
 * @param {string} [props.height]
 */
const Skeleton = ({ className = '', width, height }) => {
  return (
    <div
      className={`skeleton rounded ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};

export default Skeleton;
