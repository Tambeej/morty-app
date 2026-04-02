/**
 * Card - Surface container component.
 */
import React from 'react';
import PropTypes from 'prop-types';

export default function Card({ children, className = '', style = {}, interactive = false }) {
  return (
    <div
      className={`rounded-card ${interactive ? 'stat-card' : ''} ${className}`}
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
  interactive: PropTypes.bool,
};
