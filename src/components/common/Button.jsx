import React from 'react';
import Spinner from './Spinner';

/**
 * Button component with multiple variants following Morty design system.
 *
 * @param {string} variant - 'primary' | 'ghost' | 'danger'
 * @param {boolean} loading - Show spinner and disable button
 * @param {boolean} disabled - Disable button
 * @param {string} type - HTML button type
 * @param {Function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 */
const Button = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  children,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-input transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy';

  const variants = {
    primary:
      'bg-gold text-navy hover:bg-gold-light shadow-md focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3',
    ghost:
      'border border-border text-text-secondary hover:border-gold hover:text-text-primary focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3',
    danger:
      'bg-error text-white hover:bg-red-600 shadow-md focus:ring-red-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-3',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
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
