/**
 * Button Component
 * Supports primary, ghost, and danger variants
 */
import React from 'react';
import Spinner from './Spinner';

/**
 * @param {Object} props
 * @param {'primary'|'ghost'|'danger'} props.variant
 * @param {boolean} props.loading
 * @param {boolean} props.disabled
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
function Button({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-navy';

  const variants = {
    primary:
      'bg-gold text-navy hover:bg-gold-light shadow-md focus-visible:ring-gold px-6 py-3 text-sm',
    ghost:
      'border border-border text-text-secondary hover:border-gold hover:text-text-primary px-6 py-3 text-sm',
    danger:
      'bg-red-500 text-white hover:bg-red-600 shadow-md focus-visible:ring-red-500 px-6 py-3 text-sm',
    sm: 'bg-gold text-navy hover:bg-gold-light px-4 py-2 text-xs font-semibold rounded-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.primary}
        ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-busy={loading}
      {...rest}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export default Button;
