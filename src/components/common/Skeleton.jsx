/**
 * Skeleton.jsx
 * Shimmer placeholder for loading states.
 *
 * Props:
 *   width   {string|number}  — CSS width  (default '100%')
 *   height  {string|number}  — CSS height (default '1rem')
 *   borderRadius {string}    — CSS border-radius (default '4px')
 *   className {string}
 */
import React from 'react';

const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '4px',
  className = '',
}) => {
  const style = {
    width,
    height,
    borderRadius,
    background:
      'linear-gradient(90deg, #273549 25%, #334155 50%, #273549 75%)',
    backgroundSize: '200% 100%',
    animation: 'morty-shimmer 1.5s infinite',
    display: 'block',
  };

  return (
    <>
      <style>{`
        @keyframes morty-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <span
        aria-hidden="true"
        className={className}
        style={style}
      />
    </>
  );
};

export default Skeleton;
