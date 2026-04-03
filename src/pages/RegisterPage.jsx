/**
 * RegisterPage — full-page registration view for Morty.
 *
 * Renders the RegisterForm component inside a centered card layout.
 * The RegisterForm handles both email/password registration and Google OAuth
 * sign-up, including success/error toasts and navigation to /dashboard.
 *
 * Layout:
 *   - Full-screen navy background
 *   - Centered card with Morty logo
 *   - RegisterForm (Google button first, then email/pass fields)
 */
import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

/**
 * Register page component.
 * Renders the full-page registration UI with Google sign-up and email/password form.
 */
export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4 py-8">
      {/* Header / Logo */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl" aria-hidden="true">🏡</span>
        <h1 className="text-3xl font-bold text-gold">Morty</h1>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-md bg-navy-surface border border-border rounded-card p-8 shadow-card"
        style={{ animation: 'pageEnter 200ms ease-out forwards' }}
      >
        <h2 className="text-xl font-semibold text-[#f8fafc] mb-6">Create your account</h2>

        {/*
          RegisterForm handles:
          - Google OAuth sign-up (shown first to reduce friction)
          - Email/password registration with full validation
          - Success toast + navigate('/dashboard') on auth success
          - Error toast on auth failure
          - Loading states for both sign-up methods
        */}
        <RegisterForm />
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-[#64748b] text-center">
        By creating an account, you agree to our{' '}
        <span className="text-[#94a3b8]">Terms of Service</span>
        {' '}and{' '}
        <span className="text-[#94a3b8]">Privacy Policy</span>.
      </p>
    </div>
  );
}
