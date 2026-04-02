/**
 * LoginPage.jsx
 * Login form page. Uses AuthContext.login() and ToastContext.addToast().
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword } from '../utils/validators';
import Spinner from '../components/common/Spinner';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const onSubmit = async ({ email, password }) => {
    const result = await login(email, password);
    if (result.success) {
      addToast('Welcome back!', 'success');
      navigate('/dashboard');
    } else {
      addToast(result.error || 'Login failed. Please try again.', 'error');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          animation: 'fadeInUp 200ms ease-out',
        }}
      >
        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '2rem' }}>🏡</span>
          <h1
            style={{
              color: '#f59e0b',
              fontSize: '1.75rem',
              fontWeight: 700,
              margin: '8px 0 4px',
            }}
          >
            Morty
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            AI-powered mortgage analysis
          </p>
        </div>

        <h2
          style={{
            color: '#f8fafc',
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '24px',
          }}
        >
          Sign In
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', { validate: validateEmail })}
              style={{
                width: '100%',
                height: '44px',
                background: '#1e293b',
                border: `1px solid ${errors.email ? '#ef4444' : '#334155'}`,
                borderRadius: '8px',
                padding: '0 16px',
                color: '#f8fafc',
                fontSize: '1rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                color: '#94a3b8',
                fontSize: '0.75rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                {...register('password', { validate: validatePassword })}
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#1e293b',
                  border: `1px solid ${errors.password ? '#ef4444' : '#334155'}`,
                  borderRadius: '8px',
                  padding: '0 44px 0 16px',
                  color: '#f8fafc',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  fontSize: '1rem',
                  padding: 0,
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '44px',
              background: loading ? '#f59e0b66' : '#f59e0b',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 150ms ease',
            }}
          >
            {loading ? (
              <>
                <Spinner size={18} color="#0f172a" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
