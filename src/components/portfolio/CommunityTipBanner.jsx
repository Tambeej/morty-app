/**
 * CommunityTipBanner.jsx
 * Displays community intelligence tips about winning bank/branch offers
 * from similar user profiles.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * CommunityTipBanner component.
 *
 * @param {Array} tips - Array of community tip objects
 */
export default function CommunityTipBanner({ tips }) {
  const [dismissed, setDismissed] = useState(false);

  if (!tips || tips.length === 0 || dismissed) {
    return null;
  }

  // Show the most relevant tip (first one)
  const primaryTip = tips[0];

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(90deg, #ECFDF5, #D1FAE5)',
        borderLeft: '4px solid #00C896',
      }}
      role="complementary"
      aria-label="טיפ מהקהילה"
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Icon */}
            <span
              className="text-xl flex-shrink-0 mt-0.5"
              role="img"
              aria-label="טיפ"
            >
              🏆
            </span>

            {/* Content */}
            <div>
              <p className="text-sm font-semibold text-green-800 mb-0.5">
                תובנה מהקהילה
              </p>
              <p className="text-sm text-green-700">
                {primaryTip.bank && primaryTip.branch ? (
                  <>
                    משתמשים עם פרופיל דומה קיבלו ריבית טובה יותר ב-
                    <strong className="font-bold">
                      {primaryTip.bank} - {primaryTip.branch}
                    </strong>
                    {primaryTip.rateDiff && (
                      <span className="mr-1">
                        (חיסכון של {primaryTip.rateDiff}%)
                      </span>
                    )}
                  </>
                ) : (
                  primaryTip.message || primaryTip.text || 'נמצאו הצעות טובות יותר עבור פרופיל דומה'
                )}
              </p>
              {primaryTip.timestamp && (
                <p className="text-xs text-green-600 mt-1">
                  לאחרונה
                </p>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors
              focus:outline-none focus:ring-2 focus:ring-green-500 rounded p-1"
            aria-label="סגור טיפ"
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

        {/* Additional tips (if more than 1) */}
        {tips.length > 1 && (
          <div className="mt-3 pt-3 border-t border-green-200">
            <p className="text-xs text-green-600 font-medium mb-2">
              עוד {tips.length - 1} תובנות:
            </p>
            <ul className="space-y-1">
              {tips.slice(1).map((tip, index) => (
                <li key={index} className="text-xs text-green-700 flex items-center gap-1.5">
                  <span aria-hidden="true">📍</span>
                  {tip.bank && tip.branch
                    ? `${tip.bank} - ${tip.branch}`
                    : tip.message || tip.text
                  }
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

CommunityTipBanner.propTypes = {
  tips: PropTypes.arrayOf(
    PropTypes.shape({
      bank: PropTypes.string,
      branch: PropTypes.string,
      rateDiff: PropTypes.number,
      message: PropTypes.string,
      text: PropTypes.string,
      timestamp: PropTypes.string,
    })
  ),
};

CommunityTipBanner.defaultProps = {
  tips: [],
};
