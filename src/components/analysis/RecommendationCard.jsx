/**
 * RecommendationCard.jsx
 * Standalone card component for displaying a single AI recommendation.
 * Used in the AnalysisPage recommendations section.
 */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * RecommendationCard
 *
 * @param {object}  props
 * @param {number}  props.index       - 1-based index for the numbered badge
 * @param {string}  props.text        - Recommendation text
 * @param {string}  [props.type]      - Optional type: 'rate' | 'term' | 'compare' | 'general'
 * @param {string}  [props.savings]   - Optional formatted savings string (e.g. "₪32,000")
 */
const RecommendationCard = ({ index, text, type, savings }) => {
  const iconMap = {
    rate:    '📉',
    term:    '📅',
    compare: '🔍',
    general: '💡',
  };

  const icon = iconMap[type] || '💡';

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-lg bg-navy-elevated border border-border hover:border-gold/40 transition-colors"
      role="listitem"
    >
      {/* Number badge */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full bg-gold/20 text-gold text-sm font-bold flex items-center justify-center"
        aria-hidden="true"
      >
        {index}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <span className="text-lg" aria-hidden="true">{icon}</span>
          <p className="text-text-primary text-sm leading-relaxed">{text}</p>
        </div>
        {savings && (
          <p className="text-gold text-xs font-semibold mt-1 ml-7">
            Potential saving: {savings}
          </p>
        )}
      </div>
    </div>
  );
};

RecommendationCard.propTypes = {
  index:   PropTypes.number.isRequired,
  text:    PropTypes.string.isRequired,
  type:    PropTypes.oneOf(['rate', 'term', 'compare', 'general']),
  savings: PropTypes.string,
};

RecommendationCard.defaultProps = {
  type:    'general',
  savings: null,
};

export default RecommendationCard;
