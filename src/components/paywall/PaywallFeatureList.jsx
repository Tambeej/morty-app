/**
 * PaywallFeatureList.jsx
 * Displays the list of features unlocked by the paid analysis.
 * Used in the left panel of the PaywallPage split layout.
 *
 * Features:
 *   - OCR comparison of bank offer vs Morty model
 *   - Mortgage tricks (enticement track, etc.)
 *   - Hebrew negotiation script
 *   - AI strategic insights
 *
 * Accessibility: semantic list, descriptive icons with aria-hidden.
 */
import React from 'react';
import PropTypes from 'prop-types';

/** Individual feature item */
function FeatureItem({ icon, title, description }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center mt-0.5"
        aria-hidden="true"
      >
        <span className="text-base">{icon}</span>
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && (
          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
    </li>
  );
}

FeatureItem.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
};

/** Trust badge item */
function TrustBadge({ icon, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-white/50">
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

TrustBadge.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

/**
 * PaywallFeatureList
 * Left panel content for the paywall page.
 *
 * @param {Object} props
 * @param {Object|null} props.portfolio - The selected portfolio (optional)
 * @param {number} props.price - Price in ILS (default: 149)
 */
export default function PaywallFeatureList({ portfolio, price = 149 }) {
  const features = [
    {
      icon: '📊',
      title: 'השוואת הצעה בנקאית',
      description: 'ניתוח OCR של ההצעה שלך מול המודל האופטימלי של Morty',
    },
    {
      icon: '🎯',
      title: 'טריקי משכנתא',
      description: 'אסטרטגיות כמו "מסלול פיתיון" לחיסכון של אלפי שקלים',
    },
    {
      icon: '📝',
      title: 'סקריפט מו"מ בעברית',
      description: 'טקסט מוכן לפגישת הבנק — מילה במילה',
    },
    {
      icon: '💡',
      title: 'תובנות AI אסטרטגיות',
      description: 'הסבר מעמיק מדוע כל המלצה מתאימה לפרופיל שלך',
    },
  ];

  const trustBadges = [
    { icon: '🔒', label: 'SSL מאובטח' },
    { icon: '💳', label: 'Stripe מאובטח' },
    { icon: '↩️', label: 'ביטול בכל עת' },
    { icon: '✅', label: 'אחריות 7 ימים' },
  ];

  return (
    <div className="flex flex-col h-full" dir="rtl">
      {/* Shield icon + heading */}
      <div className="mb-6">
        <div
          className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-4"
          aria-hidden="true"
        >
          <svg
            className="w-7 h-7 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">מה תקבל בניתוח המקצועי</h2>
        <p className="text-sm text-white/60">ניתוח מלא ומותאם אישית לתיק שבחרת</p>
      </div>

      {/* Selected portfolio summary */}
      {portfolio && (
        <div className="mb-6 p-4 rounded-xl bg-white/10 border border-white/20">
          <p className="text-xs text-white/50 font-medium mb-1">תיק נבחר</p>
          <p className="text-base font-bold text-white">
            {portfolio.nameHe || portfolio.name}
          </p>
          {portfolio.termYears && (
            <p className="text-xs text-white/60 mt-1">{portfolio.termYears} שנה</p>
          )}
        </div>
      )}

      {/* Feature list */}
      <ul className="space-y-4 flex-1" aria-label="תכולת הניתוח המקצועי">
        {features.map((feature, index) => (
          <FeatureItem key={index} {...feature} />
        ))}
      </ul>

      {/* Price */}
      <div className="mt-8 pt-6 border-t border-white/20">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-bold text-white" dir="ltr">₪{price}</span>
          <span className="text-sm text-white/60">לניתוח</span>
        </div>
        <p className="text-xs text-white/50">תשלום חד-פעמי · ללא מנוי</p>
      </div>

      {/* Trust badges */}
      <div className="mt-4 flex flex-wrap gap-3">
        {trustBadges.map((badge, index) => (
          <TrustBadge key={index} {...badge} />
        ))}
      </div>
    </div>
  );
}

PaywallFeatureList.propTypes = {
  portfolio: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    nameHe: PropTypes.string,
    termYears: PropTypes.number,
  }),
  price: PropTypes.number,
};

PaywallFeatureList.defaultProps = {
  portfolio: null,
  price: 149,
};
