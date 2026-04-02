/**
 * Spinner component
 * Animated loading spinner using the gold accent color.
 *
 * @param {number} [size=24] - Size in pixels
 * @param {string} [color='#f59e0b'] - Spinner color
 * @param {string} [className] - Additional CSS class
 */
import React from 'react';

const Spinner = ({ size = 24, color = '#f59e0b', className = '', style = {} }) => (
  <>
    <style>{`
      @keyframes morty-spin {
        to { transform: rotate(360deg); }
      }
      .morty-spinner {
        animation: morty-spin 600ms linear infinite;
        border-radius: 50%;
        display: inline-block;
        flex-shrink: 0;
      }
    `}</style>
    <span
      role="status"
      aria-label="Loading"
      className={`morty-spinner ${className}`}
      style={{
        width: size,
        height: size,
        border: `3px solid rgba(245, 158, 11, 0.2)`,
        borderTopColor: color,
        ...style,
      }}
    />
  </>
);

export default Spinner;
