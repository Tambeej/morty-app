import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(function Input({ label, error, hint, prefix, suffix, className, id, ...props }, ref) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-400 text-sm select-none" aria-hidden="true">{prefix}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'w-full h-11 bg-navy-surface border rounded-input text-white placeholder-slate-500',
            'transition-all duration-150',
            'focus:outline-none focus:ring-[3px] focus:ring-gold/20 focus:border-gold',
            error ? 'border-error focus:ring-error/20 focus:border-error' : 'border-border',
            prefix && 'pl-8',
            suffix && 'pr-10',
            !prefix && 'px-4'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-400" aria-hidden="true">{suffix}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
});

export default Input;
