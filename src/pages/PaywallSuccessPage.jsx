/**
 * PaywallSuccessPage.jsx
 * Post-payment success page shown after Stripe Checkout completes.
 * Route: /paywall/success?session_id=xxx&portfolio_id=yyy
 *
 * Flow:
 *   1. Stripe redirects here with session_id query param
 *   2. Page verifies payment status via GET /stripe/status?session_id=xxx
 *   3. On success: shows confirmation + CTA to upload offer
 *   4. On failure: shows error + retry option
 *
 * Accessibility:
 *   - dir="rtl" for Hebrew content
 *   - Live region for status updates
 *   - Descriptive headings
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { verifyPaymentStatus } from '../services/paymentService';
import { formatCurrency } from '../utils/formatters';
import { getStoredSelectedPortfolio } from '../services/portfolioService';

/** Loading state */
function LoadingState() {
  return (
    <div className="text-center py-12" aria-live="polite" aria-busy="true">
      <div
        className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
        aria-hidden="true"
      >
        <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin block" />
      </div>
      <p className="text-text2 font-medium">מאמת את התשלום...</p>
      <p className="text-sm text-text3 mt-1">אנא המתן מספר שניות</p>
    </div>
  );
}

/** Success state */
function SuccessState({ portfolio, onContinue }) {
  return (
    <div className="text-center" aria-live="polite">
      {/* Success icon */}
      <div
        className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6"
        aria-hidden="true"
      >
        <svg
          className="w-10 h-10 text-accent"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-text1 mb-2">התשלום הושלם בהצלחה!</h1>
      <p className="text-text2 mb-6">
        הניתוח המקצועי שלך מוכן. כעת העלה את ההצעה הבנקאית שלך לקבלת הדוח המלא.
      </p>

      {/* Portfolio summary */}
      {portfolio && (
        <div className="mb-6 p-4 rounded-xl bg-surface border border-border text-right">
          <p className="text-xs text-text3 font-medium mb-1">תיק שנבחר לניתוח</p>
          <p className="text-base font-bold text-text1">
            {portfolio.nameHe || portfolio.name}
          </p>
          {portfolio.monthlyRepayment && (
            <p className="text-sm text-text2 mt-1">
              החזר חודשי:{' '}
              <span className="font-semibold text-primary" dir="ltr">
                {formatCurrency(portfolio.monthlyRepayment)}
              </span>
            </p>
          )}
        </div>
      )}

      {/* What's next */}
      <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/10 text-right">
        <p className="text-sm font-semibold text-primary mb-3">השלבים הבאים:</p>
        <ol className="space-y-2 text-sm text-text2">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold mt-0.5">1</span>
            <span>העלה את ההצעה הבנקאית שלך (PDF)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold mt-0.5">2</span>
            <span>Morty ינתח את ההצעה ויכין דוח מקצועי</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold mt-0.5">3</span>
            <span>קבל טריקים, סקריפט מו"מ ותובנות AI</span>
          </li>
        </ol>
      </div>

      {/* CTA buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="
            w-full py-4 px-6 rounded-lg font-bold text-base
            bg-accent text-white
            hover:bg-accent/90 active:scale-[0.98]
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2
            flex items-center justify-center gap-2
          "
          aria-label="עבור להעלאת ההצעה הבנקאית"
        >
          <span>העלה הצעה בנקאית</span>
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <Link
          to="/dashboard"
          className="
            block w-full py-3 px-6 rounded-lg font-medium text-sm text-center
            border border-border text-text2
            hover:bg-surface hover:border-primary hover:text-primary
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
          "
        >
          עבור ללוח הבקרה
        </Link>
      </div>
    </div>
  );
}

/** Error state */
function ErrorState({ error, onRetry }) {
  return (
    <div className="text-center" aria-live="assertive">
      {/* Error icon */}
      <div
        className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6"
        aria-hidden="true"
      >
        <svg
          className="w-10 h-10 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-text1 mb-2">שגיאה באימות התשלום</h1>
      <p className="text-text2 mb-2">{error}</p>
      <p className="text-sm text-text3 mb-8">
        אם בוצע חיוב, צור קשר עם התמיכה.
      </p>

      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="
            w-full py-3 px-6 rounded-lg font-semibold text-sm
            bg-primary text-white
            hover:bg-primary/90 active:scale-[0.98]
            transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
          "
        >
          נסה שוב
        </button>

        <Link
          to="/paywall"
          className="
            block w-full py-3 px-6 rounded-lg font-medium text-sm text-center
            border border-border text-text2
            hover:bg-surface transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
          "
        >
          חזור לדף התשלום
        </Link>
      </div>
    </div>
  );
}

/**
 * PaywallSuccessPage — main component.
 */
export default function PaywallSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('session_id');
  const portfolioId = searchParams.get('portfolio_id');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState(() => getStoredSelectedPortfolio());

  /** Verify payment status on mount */
  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('מזהה תשלום חסר. אנא חזור לדף התשלום.');
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const result = await verifyPaymentStatus(sessionId);
        if (cancelled) return;

        if (result.paid || result.status === 'complete' || result.status === 'paid') {
          setStatus('success');
        } else {
          setStatus('error');
          setError('התשלום לא הושלם. אנא נסה שוב.');
        }
      } catch (err) {
        if (cancelled) return;
        setStatus('error');
        setError(err.message || 'שגיאה בבדיקת סטטוס התשלום');
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [sessionId]);

  /** Navigate to upload page after successful payment */
  const handleContinue = useCallback(() => {
    navigate('/upload', {
      state: { portfolioId, fromPaywall: true },
    });
  }, [navigate, portfolioId]);

  /** Retry payment verification */
  const handleRetry = useCallback(() => {
    setStatus('loading');
    setError(null);
    // Re-trigger the effect by navigating to the same page
    navigate(location.pathname + location.search, { replace: true });
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Navbar */}
      <nav
        className="bg-white border-b border-border"
        role="navigation"
        aria-label="ניווט ראשי"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
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
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main
        className="max-w-lg mx-auto px-4 py-12"
        id="main-content"
        aria-label="אישור תשלום"
      >
        <div className="bg-white rounded-2xl p-8 shadow-card">
          {status === 'loading' && <LoadingState />}
          {status === 'success' && (
            <SuccessState
              portfolio={portfolio}
              onContinue={handleContinue}
            />
          )}
          {status === 'error' && (
            <ErrorState
              error={error}
              onRetry={handleRetry}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs text-center py-4 px-6 mt-8">
        Morty הינו כלי תמיכה בהחלטות בלבד ואינו משמש כייעוץ פיננסי מורשה.
      </footer>
    </div>
  );
}
