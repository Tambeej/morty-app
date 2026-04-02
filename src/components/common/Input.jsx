/**
 * Input Component
 * With error state, RTL support, and optional prefix/suffix
 */
import React, { forwardRef } from 'react';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.error
 * @param {string} props.prefix - e.g. "₪"
 * @param {React.ReactNode} props.suffix
 * @param {string} props.className
 */
const Input = forwardRef(function Input(
  { label, error, prefix, suffix, className = '', id, ...rest },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wider text-text-secondary"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 rtl:left-auto rtl:right-3 text-text-muted text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 rounded-lg bg-navy-surface border text-text-primary placeholder-text-muted
            text-sm transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-gold/20
            ${prefix ? 'pl-8 rtl:pl-4 rtl:pr-8' : 'px-4'}
            ${suffix ? 'pr-10' : ''}
            ${error
              ? 'border-red-500 focus:border-red-500'
              : 'border-border focus:border-gold'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 rtl:right-auto rtl:left-3 text-text-muted">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
