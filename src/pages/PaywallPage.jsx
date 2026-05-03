/**
 * PaywallPage.jsx
 * The paywall page where users sign up and pay to unlock professional analysis.
 * Route: /paywall (accessible after selecting a portfolio)
 *
 * Layout (split):
 *   Left panel (navy bg):  Feature list + price + trust badges
 *   Right panel (white):   Signup form (email/password or Google) + Stripe payment
 *
 * User flows:
 *   A. Unauthenticated user:
 *      1. Fill in email + password (or use Google)
 *      2. Account is created
 *      3. Stripe Checkout redirect
 *
 *   B. Authenticated user:
 *      1. Skip signup form (show welcome)
 *      2. Stripe Checkout redirect directly
 *
 * Portfolio context:
 *   - Retrieved from location.state (passed by SavePortfolioModal)
 *   - Falls back to sessionStorage (morty_selected_portfolio)
 *   - Falls back to URL query param portfolio_id
 *
 * Accessibility:
 *   - dir="rtl" for Hebrew content
 *   - Semantic headings and landmarks
 *   - ARIA labels on interactive elements
 *   - Focus management
 */
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaywallFeatureList from '../components/paywall/PaywallFeatureList';
import StripePaymentForm from '../components/paywall/StripePaymentForm';
import { getStoredSelectedPortfolio } from '../services/portfolioService';
import { formatCurrency } from '../utils/formatters';
import '../styles/paywall.css';

/** Price constant — single source of truth */
const ANALYSIS_PRICE = 149;

/**
 * Inline signup form for unauthenticated users on the paywall page.
 * Simplified version: email + password + Google OAuth.
 */
function PaywallSignupForm({ onAuthSuccess, isLoading, setIsLoading }) {
  const { registerUser, googleLoginUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  /** Validate email/password fields */
  const validate = useCallback(() => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'נדרשת כתובת אימייל';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'כתובת אימייל לא תקינה';
    }
    if (!password) {
      newErrors.password = 'נדרשת סיסמה';
    } else if (password.length < 8) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 8 תווים';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  /** Handle email/password registration */
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setIsLoading(true);
      setSubmitError(null);

      try {
        const result = await registerUser({ email, password });
        if (result && result.success === false) {
          setSubmitError(result.error || 'שגיאה בהרשמה. נסה שוב.');
          return;
        }
        // Registration successful — proceed to payment
        if (onAuthSuccess) onAuthSuccess();
      } catch (err) {
        setSubmitError(
          err.response?.data?.message ||
          err.message ||
          'שגיאה בהרשמה. נסה שוב.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, validate, registerUser, onAuthSuccess, setIsLoading]
  );

  /** Handle Google OAuth sign-up */
  const handleGoogleSignup = useCallback(async () => {
    setIsGoogleLoading(true);
    setSubmitError(null);
    try {
      const result = await googleLoginUser();
      if (result === null) return; // User closed popup
      if (result.success) {
        if (onAuthSuccess) onAuthSuccess();
      } else {
        setSubmitError(result.error || 'שגיאה בהתחברות עם Google');
      }
    } catch (err) {
      setSubmitError(err.message || 'שגיאה בהתחברות עם Google');
    } finally {
      setIsGoogleLoading(false);
    }
  }, [googleLoginUser, onAuthSuccess]);

  return (
    <div className="space-y-4">
      {/* Google sign-up button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isGoogleLoading || isLoading}
        aria-busy={isGoogleLoading}
        aria-label="הרשמה עם Google"
        className="
          w-full flex items-center justify-center gap-3
          bg-white text-gray-700 font-medium text-sm
          border border-gray-300 rounded-lg px-4 py-3
          hover:bg-gray-50 hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150 shadow-sm
        "
      >
        {isGoogleLoading ? (
          <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        ) : (
          <GoogleIcon />
        )}
        <span>{isGoogleLoading ? 'מתחבר...' : 'הרשמה עם Google'}</span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3" role="separator">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-text3 uppercase tracking-wider">או</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email/password form */}
      <form onSubmit={handleSubmit} noValidate aria-label="טופס הרשמה">
        <div className="space-y-3">
          {/* Email field */}
          <div>
            <label
              htmlFor="paywall-email"
              className="block text-sm font-medium text-text1 mb-1"
            >
              אימייל
            </label>
            <input
              id="paywall-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => validate()}
              placeholder="your@email.com"
              autoComplete="email"
              dir="ltr"
              className={`
                w-full px-4 py-3 rounded-md border bg-white text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-colors placeholder:text-text3
                ${errors.email ? 'border-danger' : 'border-border'}
              `}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'paywall-email-error' : undefined}
            />
            {errors.email && (
              <p
                id="paywall-email-error"
                className="mt-1 text-xs text-danger"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="paywall-password"
              className="block text-sm font-medium text-text1 mb-1"
            >
              סיסמה
            </label>
            <input
              id="paywall-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => validate()}
              placeholder="לפחות 8 תווים"
              autoComplete="new-password"
              dir="ltr"
              className={`
                w-full px-4 py-3 rounded-md border bg-white text-sm
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-colors placeholder:text-text3
                ${errors.password ? 'border-danger' : 'border-border'}
              `}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'paywall-password-error' : undefined}
            />
            {errors.password && (
              <p
                id="paywall-password-error"
                className="mt-1 text-xs text-danger"
                role="alert"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit error */}
          {submitError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger"
            >
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            aria-busy={isLoading}
            className="
              w-full py-3 px-6 rounded-lg font-semibold text-sm
              bg-primary text-white
              hover:bg-primary/90 active:scale-[0.98]
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" aria-hidden="true" />
                <span>יוצר חשבון...</span>
              </>
            ) : (
              'צור חשבון והמשך לתשלום'
            )}
          </button>
        </div>
      </form>

      {/* Login link */}
      <p className="text-center text-sm text-text2">
        יש לך כבר חשבון?{' '}
        <Link
          to="/login"
          className="text-primary font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
        >
          כניסה
        </Link>
      </p>
    </div>
  );
}

/** Google SVG icon */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
  );
}

/**
 * PaywallPage — main component.
 */
export default function PaywallPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Retrieve portfolio from multiple sources
  const [portfolio, setPortfolio] = useState(() => {
    // 1. From navigation state (passed by SavePortfolioModal)
    if (location.state?.portfolio) return location.state.portfolio;
    // 2. From sessionStorage
    return getStoredSelectedPortfolio();
  });

  const portfolioId =
    portfolio?.id ||
    location.state?.portfolioId ||
    new URLSearchParams(location.search).get('portfolio_id');

  // Check if user was redirected back after cancelling payment
  const wasCancelled = new URLSearchParams(location.search).get('cancelled') === 'true';

  // Auth state for the signup form
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authComplete, setAuthComplete] = useState(isAuthenticated);
  const [showPayment, setShowPayment] = useState(isAuthenticated);

  // Update auth state when context changes
  useEffect(() => {
    if (isAuthenticated) {
      setAuthComplete(true);
      setShowPayment(true);
    }
  }, [isAuthenticated]);

  /**
   * Called after successful registration/login.
   * Transitions the UI to show the payment form.
   */
  const handleAuthSuccess = useCallback(() => {
    setAuthComplete(true);
    setShowPayment(true);
  }, []);

  /**
   * Handle payment errors from StripePaymentForm.
   */
  const handlePaymentError = useCallback((errorMessage) => {
    // Error is displayed within StripePaymentForm itself
    console.error('[PaywallPage] Payment error:', errorMessage);
  }, []);

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Navbar */}
      <PaywallNavbar />

      {/* Main split layout */}
      <main
        className="max-w-5xl mx-auto px-4 py-8 sm:py-12"
        id="main-content"
        aria-label="דף תשלום לניתוח מקצועי"
      >
        {/* Cancelled payment banner */}
        {wasCancelled && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-xl bg-warning/10 border border-warning/20 flex items-center gap-3"
          >
            <span aria-hidden="true" className="text-xl">⚠️</span>
            <div>
              <p className="text-sm font-semibold text-warning">התשלום בוטל</p>
              <p className="text-xs text-text2 mt-0.5">
                התשלום לא הושלם. ניתן לנסות שוב בכל עת.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left panel: Feature list (navy background) */}
          <div
            className="
              rounded-2xl p-8
              bg-gradient-to-br from-primary to-blue-700
              paywall-left-panel
            "
            aria-label="תכולת הניתוח המקצועי"
          >
            <PaywallFeatureList
              portfolio={portfolio}
              price={ANALYSIS_PRICE}
            />
          </div>

          {/* Right panel: Signup + Payment */}
          <div
            className="bg-white rounded-2xl p-8 shadow-card"
            aria-label="טופס הרשמה ותשלום"
          >
            {/* Panel heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-text1 mb-1">
                {authComplete
                  ? 'בחר אמצעי תשלום'
                  : 'הרשמה לניתוח מקצועי'}
              </h1>
              <p className="text-sm text-text2">
                {authComplete
                  ? `שלום${user?.email ? `, ${user.email}` : ''}! לחץ כדי להמשיך לתשלום מאובטח`
                  : 'צור חשבון חינמי ולאחר מכן בצע תשלום לניתוח המקצועי'}
              </p>
            </div>

            {/* Authenticated user: show welcome + payment directly */}
            {authComplete ? (
              <div className="space-y-6">
                {/* Authenticated welcome */}
                {isAuthenticated && (
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex items-center gap-3">
                    <span aria-hidden="true" className="text-xl">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-accent">מחובר לחשבון</p>
                      <p className="text-xs text-text2">{user?.email}</p>
                    </div>
                  </div>
                )}

                {/* Portfolio summary */}
                {portfolio && (
                  <PortfolioSummaryCard portfolio={portfolio} />
                )}

                {/* Stripe payment */}
                <StripePaymentForm
                  portfolioId={portfolioId}
                  price={ANALYSIS_PRICE}
                  onError={handlePaymentError}
                />
              </div>
            ) : (
              /* Unauthenticated: show signup form */
              <div className="space-y-6">
                {/* Portfolio summary */}
                {portfolio && (
                  <PortfolioSummaryCard portfolio={portfolio} />
                )}

                {/* Signup form */}
                <PaywallSignupForm
                  onAuthSuccess={handleAuthSuccess}
                  isLoading={isAuthLoading}
                  setIsLoading={setIsAuthLoading}
                />
              </div>
            )}

            {/* Back link */}
            <div className="mt-6 pt-4 border-t border-border text-center">
              <button
                onClick={() => navigate('/wizard/compare')}
                className="text-sm text-text3 hover:text-text2 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
                aria-label="חזור לדף ההשוואה"
              >
                ← חזור לבחירת תיק
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Legal disclaimer footer */}
      <PaywallFooter />
    </div>
  );
}

/** Compact portfolio summary card for the right panel */
function PortfolioSummaryCard({ portfolio }) {
  return (
    <div
      className="p-4 rounded-xl bg-surface border border-border"
      aria-label="תיק נבחר"
    >
      <p className="text-xs text-text3 font-medium mb-1">תיק נבחר לניתוח</p>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-text1">
          {portfolio.nameHe || portfolio.name}
        </p>
        {portfolio.termYears && (
          <span className="text-xs text-text3 bg-border/50 px-2 py-0.5 rounded-full">
            {portfolio.termYears} שנה
          </span>
        )}
      </div>
      {portfolio.monthlyRepayment && (
        <p className="text-xs text-text2 mt-1">
          החזר חודשי:{' '}
          <span className="font-semibold text-primary" dir="ltr">
            {formatCurrency(portfolio.monthlyRepayment)}
          </span>
        </p>
      )}
    </div>
  );
}

/** Navbar for the paywall page */
function PaywallNavbar() {
  return (
    <nav
      className="bg-white border-b border-border sticky top-0 z-40"
      role="navigation"
      aria-label="ניווט ראשי"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a
            href="/"
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
            aria-label="Morty - דף הבית"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm" aria-hidden="true">M</span>
            </div>
            <span className="font-bold text-xl text-text1">Morty</span>
          </a>

          {/* Step indicator */}
          <div className="flex items-center gap-2 text-sm text-text2">
            <span className="hidden sm:inline">שלב 3 מתוך 3:</span>
            <span className="font-medium text-primary">תשלום</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

/** Legal disclaimer footer */
function PaywallFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs text-center py-4 px-6 mt-8">
      Morty הינו כלי תמיכה בהחלטות בלבד ואינו משמש כייעוץ פיננסי מורשה.
      כל המידע מוצג למטרות מידע בלבד. אין להסתמך עליו כתחליף לייעוץ מקצועי.
      <span className="mx-2">·</span>
      התשלום מעובד באמצעות Stripe בצורה מאובטחת.
    </footer>
  );
}
