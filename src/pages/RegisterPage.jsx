/**
 * RegisterPage - New user registration.
 * Uses useAuth().register({ email, password, fullName, phone }) and useToast().addToast().
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/common/Spinner';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .regex(/^(\+972|0)[0-9]{8,9}$/, 'Enter a valid Israeli phone number (e.g. 050-1234567)'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const { addToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phone: data.phone,
      });
      addToast('Account created successfully! Welcome to Morty.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err?.response?.data?.error || 'Registration failed. Please try again.';
      addToast(message, 'error');
    }
  };

  const inputStyle = (hasError) => ({
    background: '#1e293b',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    borderRadius: '8px',
    color: '#f8fafc',
    height: '44px',
    padding: '0 16px',
    width: '100%',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  });

  const handleFocus = (e, hasError) => {
    if (!hasError) {
      e.target.style.borderColor = '#f59e0b';
      e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.2)';
    }
  };

  const handleBlur = (e, hasError) => {
    if (!hasError) {
      e.target.style.borderColor = '#334155';
      e.target.style.boxShadow = 'none';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: '#0f172a' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <svg
              className="w-8 h-8"
              style={{ color: '#f59e0b' }}
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-2xl font-bold" style={{ color: '#f8fafc' }}>
              Morty
            </span>
          </div>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            AI-Powered Mortgage Analysis
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-card p-8 page-enter"
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#f8fafc' }}>
            Create Your Account
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Full Name */}
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#94a3b8' }}
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                placeholder="Yoav Cohen"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                style={inputStyle(!!errors.fullName)}
                onFocus={(e) => handleFocus(e, !!errors.fullName)}
                onBlur={(e) => handleBlur(e, !!errors.fullName)}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p id="fullName-error" className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#94a3b8' }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                style={inputStyle(!!errors.email)}
                onFocus={(e) => handleFocus(e, !!errors.email)}
                onBlur={(e) => handleBlur(e, !!errors.email)}
                {...register('email')}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#94a3b8' }}
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+972501234567"
                aria-invalid={!!errors.phone}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                style={inputStyle(!!errors.phone)}
                onFocus={(e) => handleFocus(e, !!errors.phone)}
                onBlur={(e) => handleBlur(e, !!errors.phone)}
                {...register('phone')}
              />
              {errors.phone && (
                <p id="phone-error" className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#94a3b8' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  style={{ ...inputStyle(!!errors.password), padding: '0 48px 0 16px' }}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#64748b' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium uppercase tracking-wider mb-2"
                style={{ color: '#94a3b8' }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
                  style={{ ...inputStyle(!!errors.confirmPassword), padding: '0 48px 0 16px' }}
                  onFocus={(e) => handleFocus(e, !!errors.confirmPassword)}
                  onBlur={(e) => handleBlur(e, !!errors.confirmPassword)}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#64748b' }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {showConfirm ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-error" className="mt-1 text-xs" style={{ color: '#ef4444' }}>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 font-semibold transition-all"
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                height: '44px',
                borderRadius: '8px',
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.background = '#fbbf24';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.background = '#f59e0b';
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner size={18} />
                  <span>Creating account...</span>
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium transition-colors"
                style={{ color: '#f59e0b' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#f59e0b')}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
