/**
 * AnalysisSummaryCard.jsx
 * Gold-bordered card displaying the AI reasoning / summary text.
 * Used at the top of the AnalysisPage.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * AnalysisSummaryCard
 *
 * @param {object} props
 * @param {string} props.reasoning   AI-generated reasoning text
 * @param {string} [props.bank]      Bank name for the title
 * @param {string} [props.className] Additional CSS classes
 */
const AnalysisSummaryCard = ({ reasoning, bank, className }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`rounded-card bg-navy-surface border border-border p-6 analysis-card ${className}`}
      style={{ borderTop: '3px solid #f59e0b' }}
      role="region"
      aria-label={t('analysis.aiSummary')}
    >
      <div className="flex items-start gap-4">
        {/* Robot icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-xl"
          aria-hidden="true"
        >
          🤖
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-label uppercase tracking-widest text-gold">
              {t('analysis.aiSummary')}
            </span>
            {bank && (
              <span className="text-xs text-text-muted">— {bank}</span>
            )}
          </div>
          <p className="text-text-primary leading-relaxed">{reasoning}</p>
        </div>
      </div>
    </div>
  );
};

AnalysisSummaryCard.propTypes = {
  reasoning: PropTypes.string.isRequired,
  bank:      PropTypes.string,
  className: PropTypes.string,
};

AnalysisSummaryCard.defaultProps = {
  bank:      null,
  className: '',
};

export default AnalysisSummaryCard;
