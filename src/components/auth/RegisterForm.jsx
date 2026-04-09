/**
 * RegisterForm component.
 *
 * Handles new user registration via email/password AND Google OAuth.
 *
 * Layout (top → bottom) — Google first to reduce friction for new users:
 *   1. Sign up with Google button (prominent, above the fold)
 *   2. "or" divider
 *   3. Full Name field
 *   4. Phone field
 *   5. Email field
 *   6. Password field
 *   7. Confirm Password field
 *   8. Create Account button
 *   9. Sign In link
 *
 * Google sign-up flow:
 *   - Calls googleLogin() from useAuth() which delegates to AuthContext.
 *   - AuthContext calls authService.googleLogin() → Firebase popup → backend.
 *   - Null return = user closed popup → silent no-op.
 *   - { success: true } → toast + navigate /dashboard.
 *   - { success: false, error } → toast with message.
 *
 * Shows inline validation errors and toast notifications.
 * Validation messages aligned with test expectations.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleButton from './GoogleButton';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Inline "or" divider between OAuth and email/password sign-up options.
 */
const OrDivider = () => (
  <div
    className="flex items-center gap-3 my-1"
    role="separator"
    aria-label="or"
  >
    <div className="flex-1 h-px bg-gray-700" />
    <span className="text-xs text-text-secondary uppercase tracking-wider">or</span>
    <div className="flex-1 h-px bg-gray-700" />
  </div>
);

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const validationRules = {
    fullName: {
      required: 'Full name is required',
      minLength: { value: 2, message: 'Full name must be at least 2 characters' },
    },
    phone: {
      required: 'Phone number is required',
      pattern: {
        value: /^(\+972|0)[0-9]{8,9}$/,
        message: 'Enter a valid Israeli phone number (e.g. 050-1234567 or +972501234567)',
      },
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
      },
    },
    password: {
      required: 'Password is required',
      minLength: { value: 8, message: 'Password must be at least 8 characters' },
    },
    confirmPassword: {
      required: 'Please confirm your password',
      validate: (value) =>
        value === getValues('password') || 'Passwords do not match',
    },
  };

  /**
   * Handle email/password registration.
   * @param {{ fullName: string, phone: string, email: string, password: string, confirmPassword: string }} data
   */
  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      if (result && result.success === false) {
        showError(result.error || 'Registration failed. Please try again.');
        return;
      }
      showSuccess('Your account has been created! Welcome to Morty');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';
      showError(message);
    }
  };

  /**
   * Handle Google OAuth sign-up via AuthContext.
   *
   * Uses googleLogin() from useAuth() so that AuthContext state is updated
   * (isAuthenticated, user, token) upon successful sign-up.
   *
   * - null result means user closed the popup → silent no-op.
   * - { success: true } → toast + navigate /dashboard.
   * - { success: false, error } → toast with error message.
   */
  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      // User closed the popup — treat as silent no-op
      if (result === null) return;
      if (result.success) {
        showSuccess('ברוך הבא! Signed up with Google');
        navigate('/dashboard');
      } else {
        showError(result.error || 'Google sign-up failed. Please try again.');
      }
    } catch (err) {
      const message =
        err?.code === 'auth/popup-blocked'
          ? 'Enable popups for this site to use Google sign-up'
          : err?.message || 'Google sign-up failed. Please try again.';
      showError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Registration form"
      className="flex flex-col gap-5"
    >
      {/* Google sign-up — placed first to reduce friction for new users */}
      <GoogleButton
        onClick={handleGoogleRegister}
        loading={isGoogleLoading}
        disabled={isSubmitting}
        label="Sign up with Google"
      />

      {/* Divider */}
      <OrDivider />

      {/* Full Name */}
      <Input
        label="Full Name"
        type="text"
        placeholder="Yoav Cohen"
        error={errors.fullName?.message}
        autoComplete="name"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        }
        {...register('fullName', validationRules.fullName)}
      />

      {/* Phone */}
      <Input
        label="Phone Number"
        type="tel"
        placeholder="050-1234567"
        error={errors.phone?.message}
        autoComplete="tel"
        helperText="Israeli format: 050-1234567 or +972-50-1234567"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        }
        {...register('phone', validationRules.phone)}
      />

      {/* Email */}
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        autoComplete="email"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
        {...register('email', validationRules.email)}
      />

      {/* Password */}
      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 characters with letters and numbers"
        error={errors.password?.message}
        autoComplete="new-password"
        helperText="At least 8 characters with letters and numbers"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
        }
        {...register('password', validationRules.password)}
      />

      {/* Confirm Password */}
      <Input
        label="Confirm Password"
        type="password"
        placeholder="Repeat your password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        }
        {...register('confirmPassword', validationRules.confirmPassword)}
      />

      {/* Primary create account button */}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        className="w-full mt-1"
      >
        Create Account
      </Button>

      {/* Sign in link */}
      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
