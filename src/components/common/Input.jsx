import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Styled input field with error state and optional prefix/suffix.
 */
const Input = forwardRef(function Input(
  { label, error, prefix, suffix, className = '', id, ...rest },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-widest text-[#94a3b8]"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-4 text-[#64748b] select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-11 rounded-input bg-navy-surface border px-4 text-[#f8fafc] placeholder-[#64748b]',
            'transition-all duration-150',
            'focus:outline-none focus:ring-[3px] focus:ring-gold/20 focus:border-gold',
            error ? 'border-red-500' : 'border-border',
            prefix ? 'pl-8' : '',
            suffix ? 'pr-8' : ''
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-4 text-[#64748b] select-none pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  className: PropTypes.string,
  id: PropTypes.string
};

export default Input;
