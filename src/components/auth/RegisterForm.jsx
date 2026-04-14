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
 *   - { success: false, error } → toast with error message.
 *
 * Shows inline validation errors and toast notifications.
 * Validation messages aligned with test expectations.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleButton from './GoogleButton';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Inline "or" divider between OAuth and email/password sign-up options.
 */
const OrDivider = ({ t }) => (
  <div
    className="flex items-center gap-3 my-1"
    role="separator"
    aria-label={t('register.or')}
  >
    <div className="flex-1 h-px bg-gray-700" />
    <span className="text-xs text-text-secondary uppercase tracking-wider">{t('register.or')}</span>
    <div className="flex-1 h-px bg-gray-700" />
  </div>
);

const RegisterForm = () => {
  const navigate = useNavigate();
  const { register: registerUser, googleLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validationRules = {
    fullName: {
      required: t('register.fullNameRequired'),
      minLength: { value: 2, message: t('register.fullNameMin') },
    },
    phone: {
      required: t('register.phoneRequired'),
      pattern: {
        value: /^(\+972|0)[0-9]{8,9}$/,
        message: t('register.phoneInvalid'),
      },
    },
    email: {
      required: t('register.emailRequired'),
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: t('register.emailInvalid'),
      },
    },
    password: {
      required: t('register.passwordRequired'),
      minLength: { value: 8, message: t('register.passwordMin') },
    },
    confirmPassword: {
      required: t('register.confirmRequired'),
      validate: (value) =>
        value === getValues('password') || t('register.passwordMismatch'),
    },
  };

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

  /**
   * Handle email/password registration.
   * @param {{ fullName: string, phone: string, email: string, password: string, confirmPassword: string }} data
   */
  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data;
      const result = await registerUser(userData);
      if (result && result.success === false) {
        showError(result.error || t('register.failed'));
        return;
      }
      showSuccess(t('register.success'));
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        t('register.failed');
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
        showSuccess(t('register.googleSuccess'));
        navigate('/dashboard');
      } else {
        showError(result.error || t('register.googleError'));
      }
    } catch (err) {
      const message =
        err?.code === 'auth/popup-blocked'
          ? t('register.popupError')
          : err?.message || t('register.googleError');
      showError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t('register.title')}
      className="flex flex-col gap-5"
    >
      {/* Google sign-up — placed first to reduce friction for new users */}
      <GoogleButton
        onClick={handleGoogleRegister}
        loading={isGoogleLoading}
        disabled={isSubmitting}
        label={t('register.google')}
      />

      {/* Divider */}
      <OrDivider t={t} />

      {/* Full Name */}
      <Input
        label={t('register.fullName')}
        type="text"
        placeholder={t('register.fullNamePlaceholder')}
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
        label={t('register.phone')}
        type="tel"
        placeholder={t('register.phonePlaceholder')}
        error={errors.phone?.message}
        autoComplete="tel"
        helperText={t('register.phoneHelper')}
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        }
        {...register('phone', validationRules.phone)}
      />

      {/* Email */}
      <Input
        label={t('register.email')}
        type="email"
        placeholder={t('register.emailPlaceholder')}
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
        label={t('register.password')}
        type="password"
        placeholder={t('register.passwordPlaceholder')}
        error={errors.password?.message}
        autoComplete="new-password"
        helperText={t('register.passwordHelper')}
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
        label={t('register.confirmPassword')}
        type="password"
        placeholder={t('register.confirmPasswordPlaceholder')}
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
        {t('register.createAccount')}
      </Button>

      {/* Sign in link */}
      <p className="text-center text-sm text-text-secondary">
        {t('register.hasAccount')}{' '}
        <Link
          to="/login"
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          {t('register.signIn')}
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
