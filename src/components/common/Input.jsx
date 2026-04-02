/**
 * Input - Form input with error state and RTL support.
 */
import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(function Input(
  { label, id, error, prefix, suffix, className = '', style: extraStyle = {}, ...rest },
  ref
) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium uppercase tracking-wider mb-2"
          style={{ color: '#94a3b8' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: '#64748b' }}
            aria-hidden="true"
          >
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          style={{
            background: '#1e293b',
            border: `1px solid ${error ? '#ef4444' : '#334155'}`,
            borderRadius: '8px',
            color: '#f8fafc',
            height: '44px',
            padding: `0 ${suffix ? '40px' : '16px'} 0 ${prefix ? '40px' : '16px'}`,
            width: '100%',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            ...extraStyle,
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.2)';
            }
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'none';
            }
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {suffix && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: '#64748b' }}
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs" style={{ color: '#ef4444' }}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default Input;
