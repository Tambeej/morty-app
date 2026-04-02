import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner.jsx';

/**
 * Reusable button component.
 *
 * @param {'primary'|'ghost'|'danger'} variant
 * @param {boolean} loading - Shows spinner and disables interaction
 * @param {boolean} disabled
 * @param {string} className - Extra Tailwind classes
 */
export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-input transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy';

  const variants = {
    primary:
      'bg-gold text-navy px-6 py-3 hover:bg-gold-light shadow-md focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:
      'border border-border text-text-secondary px-6 py-3 hover:border-gold hover:text-text-primary focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed',
    danger:
      'bg-red-500 text-white px-6 py-3 hover:bg-red-600 focus:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {loading ? 'Loading...' : children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  type: PropTypes.string,
  onClick: PropTypes.func
};
