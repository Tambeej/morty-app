/**
 * PortfolioCard.jsx
 * Displays a single mortgage portfolio scenario with track breakdown,
 * monthly repayment, total cost, and selection CTA.
 */
import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import TrackBreakdownBar from './TrackBreakdownBar';
import { formatCurrency } from '../../utils/formatters';

/**
 * Visual configuration per portfolio type.
 * Defines border color, badge text, and icon.
 */
const PORTFOLIO_CONFIG = {
  market_standard: {
    borderColor: '#94A3B8',
    borderClass: 'border-l-slate-400',
    label: 'שוק סטנדרטי',
    icon: '🏦',
    badgeText: null,
    badgeClass: '',
  },
  fast_track: {
    borderColor: '#00C896',
    borderClass: 'border-l-accent',
    label: 'מסלול מהיר',
    icon: '⚡',
    badgeText: 'חיסכון בריבית',
    badgeClass: 'bg-accent/10 text-accent border border-accent/20',
  },
  inflation_proof: {
    borderColor: '#0D6EFD',
    borderClass: 'border-l-blue-500',
    label: 'חסין אינפלציה',
    icon: '🛡️',
    badgeText: 'הגנה מאינפלציה',
    badgeClass: 'bg-blue-50 text-blue-600 border border-blue-200',
  },
  stability_first: {
    borderColor: '#8B5CF6',
    borderClass: 'border-l-purple-500',
    label: 'יציבות קודם',
    icon: '🔒',
    badgeText: 'ריבית קבועה',
    badgeClass: 'bg-purple-50 text-purple-600 border border-purple-200',
  },
};

/**
 * Get the left-border color style for a portfolio type.
 * Uses inline style since Tailwind can't dynamically generate arbitrary colors.
 */
function getBorderStyle(type) {
  const config = PORTFOLIO_CONFIG[type];
  return config ? { borderLeftColor: config.borderColor } : { borderLeftColor: '#94A3B8' };
}

/**
 * PortfolioCard component.
 *
 * @param {Object} portfolio - Portfolio data from API
 * @param {boolean} isSelected - Whether this card is currently selected
 * @param {Function} onSelect - Callback when user selects this portfolio
 */
export default function PortfolioCard({ portfolio, isSelected, onSelect }) {
  const config = PORTFOLIO_CONFIG[portfolio.type] || PORTFOLIO_CONFIG.market_standard;

  const handleSelect = useCallback(() => {
    onSelect(portfolio.id);
  }, [onSelect, portfolio.id]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(portfolio.id);
    }
  }, [onSelect, portfolio.id]);

  // Calculate interest savings display
  const hasSavings = portfolio.interestSavings && portfolio.interestSavings > 0;

  return (
    <article
      className={`
        relative bg-white rounded-2xl border-l-4 transition-all duration-200 cursor-pointer
        hover:-translate-y-1
        ${isSelected
          ? 'ring-2 ring-accent scale-[1.02] shadow-card-hover'
          : 'shadow-card hover:shadow-card-hover'
        }
      `}
      style={{
        ...getBorderStyle(portfolio.type),
        boxShadow: isSelected
          ? '0 4px 12px rgba(0,0,0,.12), 0 16px 48px rgba(26,60,94,.15)'
          : '0 1px 3px rgba(0,0,0,.08), 0 8px 32px rgba(26,60,94,.10)',
      }}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`תיק ${portfolio.nameHe || portfolio.name} - ${isSelected ? 'נבחר' : 'לחץ לבחירה'}`}
    >
      <div className="p-6">
        {/* Header: Badge + Recommended */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex flex-wrap gap-2">
            {/* Type badge */}
            {config.badgeText && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.badgeClass}`}
                aria-label={config.badgeText}
              >
                {config.badgeText}
              </span>
            )}
            {/* Savings badge for fast_track */}
            {hasSavings && portfolio.type === 'fast_track' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                חסוך {formatCurrency(portfolio.interestSavings)} בריבית
              </span>
            )}
          </div>
          {/* Recommended badge */}
          {portfolio.recommended && (
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent text-white flex-shrink-0"
              aria-label="תיק מומלץ"
            >
              מומלץ ✓
            </span>
          )}
        </div>

        {/* Portfolio Title */}
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl" role="img" aria-hidden="true">{config.icon}</span>
          <div>
            <h2 className="text-lg font-bold text-text1 leading-tight">
              {portfolio.nameHe || portfolio.name}
            </h2>
            <p className="text-sm text-text3">
              {portfolio.termYears} שנה
              {portfolio.description && ` · ${portfolio.description}`}
            </p>
          </div>
        </div>

        {/* Track Breakdown */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-text3 uppercase tracking-wide mb-3">
            פירוט המסלולים
          </h3>
          <TrackBreakdownBar tracks={portfolio.tracks} />
        </div>

        {/* Financial Summary */}
        <div
          className="mt-5 rounded-xl bg-surface p-4 space-y-2.5"
          aria-label="סיכום פיננסי"
        >
          <FinancialRow
            label="החזר חודשי"
            value={formatCurrency(portfolio.monthlyRepayment)}
            valueClass="text-primary font-bold text-lg"
            isHighlight
          />
          <div className="border-t border-border" aria-hidden="true" />
          <FinancialRow
            label="עלות כוללת"
            value={formatCurrency(portfolio.totalCost)}
          />
          <FinancialRow
            label="סה\"כ ריבית"
            value={formatCurrency(portfolio.totalInterest)}
            valueClass="text-text2"
          />
        </div>

        {/* Fitness Score (if available) */}
        {portfolio.fitnessScore !== undefined && portfolio.fitnessScore !== null && (
          <div className="mt-4">
            <FitnessScoreBar score={portfolio.fitnessScore} />
          </div>
        )}

        {/* Select Button */}
        <button
          className={`
            mt-5 w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isSelected
              ? 'bg-accent text-white focus:ring-accent/40 cursor-default'
              : 'bg-primary text-white hover:bg-primary/90 active:scale-[0.98] focus:ring-primary/40'
            }
          `}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          aria-pressed={isSelected}
          aria-label={isSelected ? 'תיק זה נבחר' : `בחר תיק ${portfolio.nameHe || portfolio.name}`}
        >
          {isSelected ? 'נבחר ✓' : 'בחר תיק זה'}
        </button>
      </div>

      {/* Selected ring pulse animation */}
      {isSelected && (
        <div
          className="absolute inset-0 rounded-2xl ring-2 ring-accent animate-pulse-ring pointer-events-none"
          aria-hidden="true"
        />
      )}
    </article>
  );
}

/**
 * A single financial summary row.
 */
function FinancialRow({ label, value, valueClass = 'text-text1 font-semibold', isHighlight = false }) {
  return (
    <div className={`flex items-center justify-between ${isHighlight ? '' : ''}`}>
      <span className="text-sm text-text2">{label}</span>
      <span
        className={`font-mono text-sm ${valueClass}`}
        dir="ltr"
        aria-label={`${label}: ${value}`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Fitness score progress bar.
 */
function FitnessScoreBar({ score }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = clampedScore >= 75 ? '#00C896' : clampedScore >= 50 ? '#F59E0B' : '#EF4444';
  const label = clampedScore >= 75 ? 'מתאים מאוד' : clampedScore >= 50 ? 'מתאים' : 'פחות מתאים';

  return (
    <div aria-label={`ציון התאמה: ${clampedScore} מתוך 100 - ${label}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-text3">ציון התאמה</span>
        <span className="text-xs font-semibold" style={{ color }}>
          {clampedScore}/100 · {label}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clampedScore}%`, backgroundColor: color }}
          role="progressbar"
          aria-valuenow={clampedScore}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

PortfolioCard.propTypes = {
  portfolio: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['market_standard', 'fast_track', 'inflation_proof', 'stability_first']).isRequired,
    name: PropTypes.string,
    nameHe: PropTypes.string,
    description: PropTypes.string,
    termYears: PropTypes.number,
    tracks: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        nameEn: PropTypes.string,
        type: PropTypes.string,
        percentage: PropTypes.number,
        rate: PropTypes.number,
        rateDisplay: PropTypes.string,
        amount: PropTypes.number,
        monthlyPayment: PropTypes.number,
        totalCost: PropTypes.number,
        totalInterest: PropTypes.number,
      })
    ),
    monthlyRepayment: PropTypes.number,
    totalCost: PropTypes.number,
    totalInterest: PropTypes.number,
    interestSavings: PropTypes.number,
    fitnessScore: PropTypes.number,
    recommended: PropTypes.bool,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};
