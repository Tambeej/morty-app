/**
 * SavePortfolioModal.jsx
 * Modal dialog shown when a user clicks "Proceed" after selecting a portfolio.
 * Handles two flows:
 *   1. Authenticated user → save portfolio via API, then redirect to paywall
 *   2. Unauthenticated user → prompt to sign up / log in, then redirect
 *
 * Accessibility: focus trap, ESC to close, ARIA dialog role.
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import { savePortfolio, storeSelectedPortfolio } from '../../services/portfolioService';
import { isAuthenticated } from '../../utils/storage';

/**
 * SavePortfolioModal
 *
 * @param {Object} portfolio - The selected portfolio object
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {Function} onClose - Callback to close the modal
 */
export default function SavePortfolioModal({ portfolio, isOpen, onClose }) {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const userIsAuthenticated = isAuthenticated();

  // Focus the modal when it opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap within modal
  const handleTabKey = useCallback((e) => {
    if (!modalRef.current) return;
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleTabKey);
    }
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isOpen, handleTabKey]);

  /**
   * Handle the primary CTA:
   * - If authenticated: save portfolio via API, then navigate to paywall
   * - If not authenticated: store portfolio in sessionStorage, navigate to register
   */
  const handleProceed = useCallback(async () => {
    if (!portfolio) return;

    // Always store portfolio in sessionStorage for cross-page access
    storeSelectedPortfolio(portfolio);

    if (userIsAuthenticated) {
      // Authenticated flow: save via API then go to paywall
      setIsSaving(true);
      setSaveError(null);
      try {
        await savePortfolio(portfolio.id);
        setSaveSuccess(true);
        // Brief success feedback before navigating
        setTimeout(() => {
          navigate('/paywall', {
            state: { portfolioId: portfolio.id, portfolio },
          });
        }, 600);
      } catch (err) {
        if (err.message === 'AUTH_REQUIRED') {
          // Token expired — redirect to register
          navigate('/register', {
            state: {
              from: '/wizard/compare',
              portfolioId: portfolio.id,
              message: 'יש להתחבר כדי לשמור את התיק ולהמשיך לניתוח',
            },
          });
        } else {
          setSaveError(err.message || 'שגיאה בשמירת התיק. נסה שוב.');
        }
      } finally {
        setIsSaving(false);
      }
    } else {
      // Unauthenticated flow: redirect to register with context
      navigate('/register', {
        state: {
          from: '/wizard/compare',
          portfolioId: portfolio.id,
          message: 'צור חשבון כדי לשמור את התיק ולקבל ניתוח מקצועי',
        },
      });
    }
  }, [portfolio, userIsAuthenticated, navigate]);

  /**
   * Handle login redirect (secondary CTA for unauthenticated users).
   */
  const handleLogin = useCallback(() => {
    if (portfolio) {
      storeSelectedPortfolio(portfolio);
    }
    navigate('/login', {
      state: {
        from: '/wizard/compare',
        portfolioId: portfolio?.id,
        message: 'התחבר כדי לשמור את התיק ולהמשיך לניתוח',
      },
    });
  }, [portfolio, navigate]);

  if (!isOpen || !portfolio) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-modal-title"
        aria-describedby="save-modal-description"
      >
        <div
          ref={modalRef}
          className="
            bg-white rounded-2xl shadow-2xl w-full max-w-md
            transform transition-all duration-300
            animate-fade-in
          "
          style={{ boxShadow: '0 20px 60px rgba(26,60,94,.25)' }}
          dir="rtl"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-5 h-5 text-accent"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2
                id="save-modal-title"
                className="text-lg font-bold text-text1"
              >
                {saveSuccess ? 'התיק נשמר בהצלחה!' : 'שמור תיק ועבור לניתוח'}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="
                w-8 h-8 rounded-lg flex items-center justify-center
                text-text3 hover:text-text1 hover:bg-surface
                transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40
              "
              aria-label="סגור"
              disabled={isSaving}
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6">
            {/* Success state */}
            {saveSuccess ? (
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4"
                  aria-hidden="true"
                >
                  <svg
                    className="w-8 h-8 text-accent"
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
                <p className="text-text2">מעביר אותך לניתוח המקצועי...</p>
              </div>
            ) : (
              <>
                {/* Selected portfolio summary */}
                <div
                  className="rounded-xl bg-surface p-4 mb-5"
                  aria-label="תיק נבחר"
                >
                  <p className="text-xs text-text3 font-medium mb-1">תיק נבחר</p>
                  <p className="text-base font-bold text-text1">
                    {portfolio.nameHe || portfolio.name}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    {portfolio.monthlyRepayment && (
                      <div>
                        <p className="text-xs text-text3">החזר חודשי</p>
                        <p
                          className="text-sm font-semibold text-primary"
                          dir="ltr"
                        >
                          {formatCurrency(portfolio.monthlyRepayment)}
                        </p>
                      </div>
                    )}
                    {portfolio.termYears && (
                      <div>
                        <p className="text-xs text-text3">תקופה</p>
                        <p className="text-sm font-semibold text-text1">
                          {portfolio.termYears} שנה
                        </p>
                      </div>
                    )}
                    {portfolio.totalInterest && (
                      <div>
                        <p className="text-xs text-text3">סה"כ ריבית</p>
                        <p
                          className="text-sm font-semibold text-text2"
                          dir="ltr"
                        >
                          {formatCurrency(portfolio.totalInterest)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description based on auth state */}
                <p
                  id="save-modal-description"
                  className="text-sm text-text2 mb-5 leading-relaxed"
                >
                  {userIsAuthenticated
                    ? 'שמור את התיק הנבחר לחשבונך והמשך לניתוח מקצועי הכולל השוואה עם ההצעה הבנקאית שלך.'
                    : 'צור חשבון חינמי כדי לשמור את התיק ולקבל ניתוח מקצועי מלא הכולל השוואה עם ההצעה הבנקאית שלך.'}
                </p>

                {/* What you get */}
                <div className="rounded-xl border border-border p-4 mb-5">
                  <p className="text-xs font-semibold text-text3 uppercase tracking-wide mb-3">
                    מה תקבל בניתוח המקצועי
                  </p>
                  <ul className="space-y-2">
                    {[
                      { icon: '📊', text: 'השוואת ההצעה הבנקאית שלך לתיק האופטימלי' },
                      { icon: '🎯', text: 'טריקי משכנתא מותאמים אישית' },
                      { icon: '📝', text: 'סקריפט מו"מ בעברית לפגישת הבנק' },
                      { icon: '💡', text: 'תובנות AI אסטרטגיות' },
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-text2">
                        <span aria-hidden="true">{item.icon}</span>
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Error message */}
                {saveError && (
                  <div
                    role="alert"
                    className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger"
                  >
                    {saveError}
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                  {/* Primary CTA */}
                  <button
                    onClick={handleProceed}
                    disabled={isSaving}
                    className="
                      w-full py-3.5 px-6 rounded-lg font-semibold text-sm
                      bg-accent text-white
                      hover:bg-accent/90 active:scale-[0.98]
                      transition-all duration-150
                      focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2
                      disabled:opacity-60 disabled:cursor-not-allowed
                      flex items-center justify-center gap-2
                    "
                    aria-label={userIsAuthenticated ? 'שמור ועבור לניתוח מקצועי' : 'צור חשבון והמשך'}
                  >
                    {isSaving ? (
                      <>
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
                        שומר...
                      </>
                    ) : (
                      <>
                        {userIsAuthenticated ? 'שמור ועבור לניתוח מקצועי' : 'צור חשבון והמשך'}
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
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Secondary CTA: Login (for unauthenticated users) */}
                  {!userIsAuthenticated && (
                    <button
                      onClick={handleLogin}
                      className="
                        w-full py-3 px-6 rounded-lg font-medium text-sm
                        border border-border text-text2
                        hover:bg-surface hover:border-primary hover:text-primary
                        active:scale-[0.98] transition-all duration-150
                        focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2
                      "
                      aria-label="כניסה לחשבון קיים"
                    >
                      יש לי כבר חשבון — כניסה
                    </button>
                  )}

                  {/* Cancel */}
                  <button
                    onClick={onClose}
                    disabled={isSaving}
                    className="
                      w-full py-2.5 px-6 rounded-lg text-sm text-text3
                      hover:text-text2 transition-colors
                      focus:outline-none focus:ring-2 focus:ring-border
                      disabled:opacity-40
                    "
                    aria-label="ביטול"
                  >
                    ביטול
                  </button>
                </div>

                {/* Trust indicators */}
                <div className="mt-5 pt-4 border-t border-border">
                  <div className="flex items-center justify-center gap-4 text-xs text-text3">
                    <span className="flex items-center gap-1">
                      <span aria-hidden="true">🔒</span> SSL מאובטח
                    </span>
                    <span className="flex items-center gap-1">
                      <span aria-hidden="true">✓</span> ללא כרטיס אשראי
                    </span>
                    <span className="flex items-center gap-1">
                      <span aria-hidden="true">🛡️</span> פרטיות מלאה
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

SavePortfolioModal.propTypes = {
  portfolio: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    nameHe: PropTypes.string,
    termYears: PropTypes.number,
    monthlyRepayment: PropTypes.number,
    totalInterest: PropTypes.number,
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

SavePortfolioModal.defaultProps = {
  portfolio: null,
};
