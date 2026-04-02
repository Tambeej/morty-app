/**
 * Button - Reusable button component.
 * Variants: primary | ghost | danger
 */
import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

const VARIANT_STYLES = {
  primary: {
    background: '#f59e0b',
    color: '#0f172a',
    border: 'none',
    hoverBg: '#fbbf24',
  },
  ghost: {
    background: 'transparent',
    color: '#94a3b8',
    border: '1px solid #334155',
    hoverBg: 'transparent',
    hoverBorder: '#f59e0b',
    hoverColor: '#f8fafc',
  },
  danger: {
    background: '#ef4444',
    color: '#ffffff',
    border: 'none',
    hoverBg: '#dc2626',
  },
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  style: extraStyle = {},
  ...rest
}) {
  const vs = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 font-semibold transition-all ${className}`}
      style={{
        background: vs.background,
        color: vs.color,
        border: vs.border || 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        fontSize: '1rem',
        ...extraStyle,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          if (vs.hoverBg) e.currentTarget.style.background = vs.hoverBg;
          if (vs.hoverBorder) e.currentTarget.style.borderColor = vs.hoverBorder;
          if (vs.hoverColor) e.currentTarget.style.color = vs.hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = vs.background;
          if (vs.border) e.currentTarget.style.borderColor = vs.border.split(' ')[2] || '';
          e.currentTarget.style.color = vs.color;
        }
      }}
      {...rest}
    >
      {loading && <Spinner size={18} color={variant === 'primary' ? '#0f172a' : '#f59e0b'} />}
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
};
