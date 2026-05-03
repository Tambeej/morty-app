/**
 * StripePaymentForm.jsx
 * Handles the Stripe payment flow for the Morty paywall.
 *
 * Flow:
 *   1. User clicks "שלם ₪149" button
 *   2. Frontend calls POST /api/v1/stripe/checkout to create a Stripe session
 *   3. User is redirected to Stripe Checkout (hosted page)
 *   4. After payment, Stripe redirects back to /paywall/success?session_id=xxx
 *
 * This component uses Stripe Checkout (redirect-based) rather than
 * Stripe Elements (embedded) for simplicity and SCA compliance.
 *
 * Accessibility:
 *   - Loading state with aria-busy
 *   - Error messages with role="alert"
 *   - Descriptive button labels
 */
import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { createCheckoutSession } from '../../services/paymentService';

/** Spinner icon for loading state */
function Spinner() {
  return (
    <svg
      className="w-4 h-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

/** Lock icon for secure payment indicator */
function LockIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

/**
 * StripePaymentForm
 *
 * @param {Object} props
 * @param {string|null} props.portfolioId - The selected portfolio ID
 * @param {number} props.price - Price in ILS (default: 149)
 * @param {boolean} props.disabled - Whether the button is disabled (e.g., form not complete)
 * @param {Function} props.onError - Callback when payment initiation fails
 */
export default function StripePaymentForm({
  portfolioId,
  price = 149,
  disabled = false,
  onError,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initiate Stripe Checkout redirect.
   * Creates a checkout session and redirects the user to Stripe's hosted page.
   */
  const handlePayment = useCallback(async () => {
    if (!portfolioId) {
      const msg = 'לא נבחר תיק משכנתא. חזור לדף ההשוואה ובחר תיק.';
      setError(msg);
      if (onError) onError(msg);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build success and cancel URLs
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/paywall/success?session_id={CHECKOUT_SESSION_ID}&portfolio_id=${encodeURIComponent(portfolioId)}`;
      const cancelUrl = `${baseUrl}/paywall?portfolio_id=${encodeURIComponent(portfolioId)}&cancelled=true`;

      const result = await createCheckoutSession({
        portfolioId,
        successUrl,
        cancelUrl,
      });

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('לא התקבל קישור לתשלום. נסה שוב.');
      }
    } catch (err) {
      const message =
        err.message === 'AUTH_REQUIRED'
          ? 'יש להתחבר לחשבון לפני ביצוע תשלום'
          : err.message || 'שגיאה בעיבוד התשלום. נסה שוב.';
      setError(message);
      if (onError) onError(message);
    } finally {
      setIsLoading(false);
    }
  }, [portfolioId, onError]);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Error message */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger flex items-start gap-2"
        >
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Payment button */}
      <button
        type="button"
        onClick={handlePayment}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        aria-label={isLoading ? 'מעבד תשלום...' : `שלם ₪${price} ועבור לניתוח מקצועי`}
        className="
          w-full py-4 px-6 rounded-lg font-bold text-base
          bg-accent text-white
          hover:bg-accent/90 active:scale-[0.98]
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2
          disabled:opacity-60 disabled:cursor-not-allowed
          flex items-center justify-center gap-2.5
          shadow-lg shadow-accent/20
        "
      >
        {isLoading ? (
          <>
            <Spinner />
            <span>מעבד...</span>
          </>
        ) : (
          <>
            <LockIcon />
            <span>שלם ₪{price} ועבור לניתוח</span>
          </>
        )}
      </button>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 text-xs text-text3">
        <LockIcon />
        <span>תשלום מאובטח באמצעות Stripe · SSL מוצפן</span>
      </div>

      {/* Trust badges row */}
      <div className="flex items-center justify-center gap-4 pt-1">
        {[
          { icon: '🔒', label: 'SSL' },
          { icon: '💳', label: 'Stripe' },
          { icon: '↩️', label: 'ביטול בכל עת' },
          { icon: '✅', label: 'אחריות 7 ימים' },
        ].map((badge, i) => (
          <div
            key={i}
            className="flex items-center gap-1 text-xs text-text3"
            aria-label={badge.label}
          >
            <span aria-hidden="true">{badge.icon}</span>
            <span className="hidden sm:inline">{badge.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

StripePaymentForm.propTypes = {
  portfolioId: PropTypes.string,
  price: PropTypes.number,
  disabled: PropTypes.bool,
  onError: PropTypes.func,
};

StripePaymentForm.defaultProps = {
  portfolioId: null,
  price: 149,
  disabled: false,
  onError: null,
};
