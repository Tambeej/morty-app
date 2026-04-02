/**
 * Button Component
 * Supports primary, ghost, and danger variants
 */

import React from 'react';
import Spinner from './Spinner';

/**
 * @param {Object} props
 * @param {'primary'|'ghost'|'danger'} props.variant - Button style variant
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable the button
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-input focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy';

  const variants = {
    primary:
      'bg-gold text-navy hover:bg-gold-light shadow-md focus:ring-gold px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed',
    ghost:
      'border border-border text-[#94a3b8] hover:border-gold hover:text-[#f8fafc] focus:ring-gold px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed',
    danger:
      'bg-error text-white hover:bg-red-600 shadow-md focus:ring-error px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
