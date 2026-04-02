import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

/**
 * Login page with email/password form.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ email, password }) {
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-navy flex flex-col items-center justify-center px-4">
      {/* Header */}
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register('email')}
          />

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-8 text-[#64748b] hover:text-[#94a3b8] text-sm"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm text-center text-[#94a3b8]">
          <p>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light font-medium">
              Register
            </Link>
          </p>
          <button className="text-[#64748b] hover:text-[#94a3b8] transition-colors">
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}
