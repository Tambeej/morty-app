/**
 * RegisterPage.jsx
 * Registration form. Uses AuthContext.register() and ToastContext.addToast().
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateFullName,
  validateIsraeliPhone,
} from '../utils/validators';
import Spinner from '../components/common/Spinner';

const RegisterPage = () => {
  const { register: registerUser, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  const passwordValue = watch('password', '');

  const onSubmit = async ({ fullName, email, phone, password }) => {
    const result = await registerUser(fullName, email, phone, password);
    if (result.success) {
      addToast('Account created! Welcome to Morty.', 'success');
      navigate('/dashboard');
    } else {
      addToast(result.error || 'Registration failed. Please try again.', 'error');
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '44px',
    background: '#1e293b',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    borderRadius: '8px',
    padding: '0 16px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  const errorStyle = { color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' };

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
          maxWidth: '460px',
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
          <h1 style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: 700, margin: '8px 0 4px' }}>
            Morty
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Create your account</p>
        </div>

        <h2 style={{ color: '#f8fafc', fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>
          Register
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Full Name */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="fullName" style={labelStyle}>Full Name</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Yoav Cohen"
              {...register('fullName', { validate: validateFullName })}
              style={inputStyle(!!errors.fullName)}
            />
            {errors.fullName && <p style={errorStyle}>{errors.fullName.message}</p>}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email', { validate: validateEmail })}
              style={inputStyle(!!errors.email)}
            />
            {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="phone" style={labelStyle}>Phone (Israeli)</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="050-1234567"
              {...register('phone', { validate: validateIsraeliPhone })}
              style={inputStyle(!!errors.phone)}
            />
            {errors.phone && <p style={errorStyle}>{errors.phone.message}</p>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('password', { validate: validatePassword })}
                style={{ ...inputStyle(!!errors.password), paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#64748b',
                  fontSize: '1rem', padding: 0,
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <p style={errorStyle}>{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirmPassword', {
                  validate: validatePasswordMatch(passwordValue),
                })}
                style={{ ...inputStyle(!!errors.confirmPassword), paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#64748b',
                  fontSize: '1rem', padding: 0,
                }}
              >
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirmPassword && (
              <p style={errorStyle}>{errors.confirmPassword.message}</p>
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
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: 600 }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
