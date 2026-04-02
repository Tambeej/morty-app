/**
 * Input Component
 * Supports error states and RTL
 */

import React, { forwardRef, useState } from 'react';

/**
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.error - Error message
 * @param {string} props.prefix - Prefix text (e.g., ₪)
 * @param {string} props.suffix - Suffix text
 * @param {boolean} props.showPasswordToggle - Show password visibility toggle
 */
const Input = forwardRef(
  (
    {
      label,
      error,
      prefix,
      suffix,
      showPasswordToggle = false,
      className = '',
      id,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const inputType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-4 text-[#94a3b8] text-sm select-none pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              w-full h-11 px-4 rounded-input
              bg-navy-surface border text-[#f8fafc] placeholder-[#64748b]
              transition-all duration-150
              ${prefix ? 'pl-8' : ''}
              ${suffix || showPasswordToggle ? 'pr-12' : ''}
              ${error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-border focus:border-gold focus:ring-gold/20'
              }
              focus:outline-none focus:ring-2
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 text-[#64748b] hover:text-[#94a3b8] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          )}
          {suffix && !showPasswordToggle && (
            <span className="absolute right-4 text-[#94a3b8] text-sm select-none pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
