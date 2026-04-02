import React from 'react';
import PropTypes from 'prop-types';
import Spinner from './Spinner';

/**
 * Button component — primary, ghost, and danger variants.
 * @param {object} props
 * @param {'primary'|'ghost'|'danger'} [props.variant]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 */
const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-input transition-all duration-150 px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy';

  const variants = {
    primary:
      'bg-gold text-navy hover:bg-gold-light shadow-md focus:ring-gold disabled:opacity-40',
    ghost:
      'border border-border text-text-secondary hover:border-gold hover:text-text-primary focus:ring-gold disabled:opacity-40',
    danger:
      'bg-error text-white hover:bg-red-600 focus:ring-error disabled:opacity-40',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${isDisabled ? 'cursor-not-allowed' : ''} ${className}`}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {loading ? 'Loading...' : children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'ghost', 'danger']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  type: PropTypes.string,
};

export default Button;
