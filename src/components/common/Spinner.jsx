/**
 * Spinner - Loading indicator.
 * @param {number} size - Diameter in pixels (default 24).
 * @param {string} color - Border color (default gold).
 */
import React from 'react';
import PropTypes from 'prop-types';

export default function Spinner({ size = 24, color = '#f59e0b' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.1)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 600ms linear infinite',
        flexShrink: 0,
      }}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
};
