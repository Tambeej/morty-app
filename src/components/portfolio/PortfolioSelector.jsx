/**
 * PortfolioSelector.jsx
 * Floating bottom bar that appears when a portfolio is selected.
 * Shows the selected portfolio name and CTA to proceed to analysis/paywall.
 * Triggers the SavePortfolioModal on proceed.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { formatCurrency } from '../../utils/formatters';

/**
 * PortfolioSelector - floating bottom action bar.
 *
 * @param {Object|null} selectedPortfolio - The currently selected portfolio object
 * @param {Function} onProceed - Callback when user clicks proceed (opens modal)
 * @param {Function} onClearSelection - Callback to deselect the portfolio
 */
export default function PortfolioSelector({ selectedPortfolio, onProceed, onClearSelection }) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in/out when selection changes
  useEffect(() => {
    if (selectedPortfolio) {
      // Small delay for smooth animation
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [selectedPortfolio]);

  if (!selectedPortfolio) return null;

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transition-transform duration-300 ease-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `}
      role="region"
      aria-label="תיק נבחר - המשך לניתוח"
      aria-live="polite"
    >
      {/* Backdrop blur */}
      <div
        className="bg-white/95 backdrop-blur-sm border-t border-border"
        style={{ boxShadow: '0 -4px 24px rgba(26,60,94,.15)' }}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Selected portfolio info */}
            <div className="flex items-center gap-3 text-right">
              {/* Deselect button */}
              <button
                onClick={onClearSelection}
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  text-text3 hover:text-text1 hover:bg-surface
                  transition-colors focus:outline-none focus:ring-2 focus:ring-border
                  flex-shrink-0
                "
                aria-label="בטל בחירה"
                title="בטל בחירה"
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

              <div
                className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
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
              <div>
                <p className="text-xs text-text3 font-medium">תיק נבחר</p>
                <p className="text-sm font-bold text-text1">
                  {selectedPortfolio.nameHe || selectedPortfolio.name}
                </p>
                {selectedPortfolio.monthlyRepayment && (
                  <p className="text-xs text-text2">
                    החזר חודשי:{' '}
                    <span className="font-semibold text-primary" dir="ltr">
                      {formatCurrency(selectedPortfolio.monthlyRepayment)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Secondary info text */}
              <p className="text-xs text-text3 text-center sm:text-right order-2 sm:order-1">
                שמור ובצע השוואה עם ההצעה הבנקאית
              </p>

              {/* Primary CTA */}
              <button
                onClick={onProceed}
                className="
                  px-6 py-3 bg-accent text-white rounded-lg font-semibold text-sm
                  hover:bg-accent/90 active:scale-[0.98] transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2
                  flex items-center justify-center gap-2
                  w-full sm:w-auto order-1 sm:order-2
                "
                aria-label="המשך לניתוח מקצועי"
              >
                המשך לניתוח מקצועי
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
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

PortfolioSelector.propTypes = {
  selectedPortfolio: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    nameHe: PropTypes.string,
    monthlyRepayment: PropTypes.number,
  }),
  onProceed: PropTypes.func.isRequired,
  onClearSelection: PropTypes.func,
};

PortfolioSelector.defaultProps = {
  selectedPortfolio: null,
  onClearSelection: () => {},
};
