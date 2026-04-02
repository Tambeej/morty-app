/**
 * Register Page
 * New user registration with validation
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Israeli phone validation
const israeliPhoneRegex = /^(\+972|0)(5[0-9]|7[0-9])[0-9]{7}$/;

// Validation schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Name must be at least 2 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(israeliPhoneRegex, 'Please enter a valid Israeli phone number'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

/**
 * Register Page Component
 */
const RegisterPage = () => {
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    if (result.success) {
      toast.success('Account created successfully! Welcome to Morty.');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Registration failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-navy" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[#f8fafc]">Morty</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
          <span>EN</span>
          <span className="text-border">|</span>
          <span className="cursor-pointer hover:text-[#f8fafc] transition-colors">עברית</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="relative bg-navy-surface border border-border rounded-card p-8 shadow-card animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-[#f8fafc] mb-2">Create Your Account</h1>
              <p className="text-[#94a3b8] text-sm">
                Start analyzing your mortgage offers with AI
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              <Input
                label="Full Name"
                type="text"
                placeholder="Yoav Cohen"
                error={errors.name?.message}
                autoComplete="name"
                {...register('name')}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                autoComplete="email"
                {...register('email')}
              />

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+972 50 000 0000"
                error={errors.phone?.message}
                autoComplete="tel"
                {...register('phone')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                error={errors.password?.message}
                showPasswordToggle
                autoComplete="new-password"
                {...register('password')}
              />

              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                error={errors.confirmPassword?.message}
                showPasswordToggle
                autoComplete="new-password"
                {...register('confirmPassword')}
              />

              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="w-full"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#94a3b8]">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-gold hover:text-gold-light font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
