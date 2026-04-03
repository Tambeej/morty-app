/**
 * LoginPage — full-page login view for Morty.
 *
 * Renders the LoginForm component inside a centered card layout.
 * The LoginForm handles both email/password and Google OAuth sign-in,
 * including success/error toasts and navigation to /dashboard.
 *
 * This page also wraps the form with the ToastProvider so that toast
 * notifications work correctly when the page is rendered standalone.
 * (The App-level ToastProvider is the primary one; this is a safety net.)
 *
 * Layout:
 *   - Full-screen navy background
 *   - Centered card with Morty logo
 *   - LoginForm (email/pass + Google button)
 */
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

/**
 * Login page component.
 * Renders the full-page login UI with email/password and Google sign-in.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
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
        <h2 className="text-xl font-semibold text-[#f8fafc] mb-6">Sign In to Morty</h2>

        {/*
          LoginForm handles:
          - Email/password sign-in with validation
          - Google OAuth sign-in via Firebase popup
          - Success toast + navigate('/dashboard') on auth success
          - Error toast on auth failure
          - Loading states for both sign-in methods
        */}
        <LoginForm />
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-[#64748b] text-center">
        By signing in, you agree to our{' '}
        <span className="text-[#94a3b8]">Terms of Service</span>
        {' '}and{' '}
        <span className="text-[#94a3b8]">Privacy Policy</span>.
      </p>
    </div>
  );
}
