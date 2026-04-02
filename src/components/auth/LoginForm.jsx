import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { loginValidationRules } from '../../utils/validators';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../common/Toast';

/**
 * LoginForm component.
 * Handles user authentication with email and password.
 * Shows inline validation errors and toast notifications.
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error: showError } = useToast();

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

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      success('Welcome back to Morty!', 'Signed in successfully');
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Invalid email or password. Please try again.';
      showError(message, 'Sign in failed');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-label="Sign in form"
      className="flex flex-col gap-5"
    >
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
        {...register('email', loginValidationRules.email)}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
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

      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-text-secondary hover:text-gold transition-colors"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={isSubmitting}
        className="w-full"
      >
        Sign In
      </Button>

      <p className="text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-gold hover:text-gold-light font-medium transition-colors"
        >
          Register
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
