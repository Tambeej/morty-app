/**
 * LoginForm component.
 *
 * Handles user authentication with email/password AND Google OAuth.
 *
 * Layout (top → bottom):
 *   1. Email field
 *   2. Password field (with visibility toggle)
 *   3. Forgot password link
 *   4. Sign In button (primary)
 *   5. "or" divider
 *   6. Continue with Google button
 *   7. Register link
 *
 * Google sign-in flow:
 *   - Calls googleLogin() from useAuth() which delegates to AuthContext.
 *   - AuthContext calls authService.googleLogin() → Firebase popup → backend.
 *   - Null return = user closed popup → silent no-op.
 *   - { success: true } → toast + navigate /dashboard.
 *   - { success: false, error } → toast with message.
 *
 * Shows inline validation errors and toast notifications.
 * Supports password visibility toggle.
 */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Input from '../common/Input';
import Button from '../common/Button';
import GoogleButton from './GoogleButton';
import { loginValidationRules } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Inline "or" divider between primary and OAuth sign-in options.
 */
const OrDivider = ({ t }) => (
  <div
    className="flex items-center gap-3 my-1"
    role="separator"
    aria-label={t('login.or')}
  >
    <div className="flex-1 h-px bg-gray-700" />
    <span className="text-xs text-text-secondary uppercase tracking-wider">{t('login.or')}</span>
    <div className="flex-1 h-px bg-gray-700" />
  </div>
);

const LoginForm = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Handle email/password sign-in.
   * @param {{ email: string, password: string }} data
   */
  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password);
      if (result && result.success === false) {
        showError(t('login.invalidCredentials'));
        return;
      }
      showSuccess(t('login.success'));
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        t('login.invalidCredentials');
      showError(message);
    }
  };

  /**
   * Handle Google OAuth sign-in via AuthContext.
   *
   * Uses googleLogin() from useAuth() so that AuthContext state is updated
   * (isAuthenticated, user, token) upon successful sign-in.
   *
   * - null result means user closed the popup → silent no-op.
   * - { success: true } → toast + navigate /dashboard.
   * - { success: false, error } → toast with error message.
   */
  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await googleLogin();
      // User closed the popup — treat as silent no-op
      if (result === null) return;
      if (result.success) {
        showSuccess(t('login.googleSuccess'));
        navigate('/dashboard');
      } else {
        showError(result.error || t('login.googleError'));
      }
    } catch (err) {
      const message =
        err?.code === 'auth/popup-blocked'
          ? t('login.popupError')
          : err?.message || t('login.googleError');
      showError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label={t('login.title')}
      className="flex flex-col gap-5"
    >
      {/* Email */}
      <Input
        label={t('login.email')}
        type="email"
        placeholder={t('login.emailPlaceholder')}
        error={errors.email?.message}
        autoComplete="email"
        leftIcon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        }
        {...register('email', loginValidationRules.email)}
      />

      {/* Password with visibility toggle */}
      <div className="relative">
        <Input
          label={t('login.password')}
          type={showPassword ? 'text' : 'password'}
          placeholder={t('login.passwordPlaceholder')}
          error={errors.password?.message}
          autoComplete="current-password"
          leftIcon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
              />
            </svg>
          }
          {...register('password', loginValidationRules.password)}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-8 text-text-secondary hover:text-text-primary text-sm transition-colors"
          aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>

      {/* Forgot password */}
      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-text-secondary hover:text-gold transition-colors"
        >
          {t('login.forgotPassword')}
        </Link>
      </div>

      {/* Primary sign-in button */}
      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        className="w-full"
      >
        {t('login.signIn')}
      </Button>

      {/* Divider */}
      <OrDivider t={t} />

      {/* Google sign-in */}
      <GoogleButton
        onClick={handleGoogleLogin}
        loading={isGoogleLoading}
        disabled={isSubmitting}
      />

      {/* Register link */}
      <p className="text-center text-sm text-text-secondary">
        {t('login.noAccount')}{' '}
        <Link
          to="/register"
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          {t('login.register')}
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
