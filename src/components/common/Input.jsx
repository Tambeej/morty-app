import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component — styled text/number input with error state and optional prefix.
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {string} [props.prefix] - e.g. '₪'
 * @param {string} [props.className]
 */
const Input = forwardRef((
  { label, error, prefix, className = '', id, ...rest },
  ref
) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary uppercase tracking-wider"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm select-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full h-11 bg-navy-surface border rounded-input text-text-primary placeholder-text-muted
            px-4 text-sm transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold
            ${prefix ? 'pl-8' : ''}
            ${error ? 'border-error' : 'border-border'}
          `}
          {...rest}
        />
      </div>
      {error && (
        <p className="text-xs text-error mt-0.5" role="alert">
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
  prefix: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default Input;
