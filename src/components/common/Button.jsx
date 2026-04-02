import React from 'react';
import { clsx } from 'clsx';
import Spinner from './Spinner';

export default function Button({ variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className, children, disabled, ...props }) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-input transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-navy';
  const variants = {
    primary: 'bg-gold text-navy hover:bg-gold-light focus:ring-gold shadow-md disabled:opacity-40 disabled:cursor-not-allowed',
    ghost: 'border border-border text-slate-400 hover:border-gold hover:text-white focus:ring-gold disabled:opacity-40 disabled:cursor-not-allowed',
    danger: 'bg-error text-white hover:bg-red-500 focus:ring-error disabled:opacity-40 disabled:cursor-not-allowed'
  };
  const sizes = { sm: 'px-3 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' };
  return (
    <button
      className={clsx(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}
