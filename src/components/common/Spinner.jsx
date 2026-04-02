/**
 * Spinner.jsx
 * Animated loading spinner using the Morty gold accent color.
 *
 * Props:
 *   size   {number}  — diameter in px (default 24)
 *   color  {string}  — border color (default gold #f59e0b)
 *   className {string}
 */
import React from 'react';

const Spinner = ({ size = 24, color = '#f59e0b', className = '' }) => {
  const style = {
    width: size,
    height: size,
    borderRadius: '50%',
    border: `3px solid ${color}33`,
    borderTopColor: color,
    animation: 'morty-spin 600ms linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  };

  return (
    <>
      <style>{`
        @keyframes morty-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span
        role="status"
        aria-label="Loading"
        className={className}
        style={style}
      />
    </>
  );
};

export default Spinner;
