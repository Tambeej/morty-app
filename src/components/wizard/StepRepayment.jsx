import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 4 - Target Repayment (החזר חודשי יעד)
 * Slider ₪2,000 → ₪20,000 with income ratio indicator.
 */

const MIN = 2000;
const MAX = 20000;
const STEP = 500;

function getRatioLabel(ratio) {
  if (ratio <= 0.3) return { label: 'טוב', color: 'text-accent', bg: 'bg-accent' };
  if (ratio <= 0.4) return { label: 'גבוה', color: 'text-warning', bg: 'bg-warning' };
  return { label: 'גבוה מאוד', color: 'text-danger', bg: 'bg-danger' };
}

export default function StepRepayment({ onNext, onPrev }) {
  const { inputs, updateInput } = useWizard();
  const repayment = inputs.targetRepayment || 5000;
  const totalIncome = (Number(inputs.primaryIncome) || 0) + (Number(inputs.additionalIncome) || 0);

  const ratio = useMemo(() => {
    if (!totalIncome) return 0;
    return repayment / totalIncome;
  }, [repayment, totalIncome]);

  const ratioPercent = Math.round(ratio * 100);
  const { label: ratioLabel, color: ratioColor } = getRatioLabel(ratio);

  const sliderPercent = ((repayment - MIN) / (MAX - MIN)) * 100;

  const handleChange = (e) => {
    updateInput('targetRepayment', Number(e.target.value));
  };

  return (
    <div className="wizard-step" dir="rtl">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">החזר חודשי יעד</h2>
          <p className="text-sm text-text2">כמה תרצה/י לשלם בחודש?</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Large repayment display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-primary" dir="ltr" aria-live="polite" aria-atomic="true">
          ₪{repayment.toLocaleString('he-IL')}
        </div>
        <div className="text-sm text-text3 mt-1">לחודש</div>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <label htmlFor="targetRepayment" className="sr-only">החזר חודשי יעד</label>
        <div className="relative">
          <input
            id="targetRepayment"
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={repayment}
            onChange={handleChange}
            className="w-full h-2 rounded-full appearance-none cursor-pointer wizard-slider"
            style={{
              background: `linear-gradient(to left, #E2E8F0 ${100 - sliderPercent}%, #1A3C5E ${100 - sliderPercent}%)`,
            }}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={repayment}
            aria-valuetext={`₪${repayment.toLocaleString('he-IL')} לחודש`}
          />
        </div>
        <div className="flex justify-between text-xs text-text3 mt-1">
          <span dir="ltr">₪{MIN.toLocaleString('he-IL')}</span>
          <span dir="ltr">₪{MAX.toLocaleString('he-IL')}</span>
        </div>
      </div>

      {/* Income ratio */}
      {totalIncome > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-surface border border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text2">אחוז מההכנסה:</span>
            <span className={`font-semibold ${ratioColor}`} dir="ltr" aria-live="polite">
              {ratioPercent}% — {ratioLabel}
            </span>
          </div>
          <div className="mt-2 h-2 bg-border rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                ratio <= 0.3 ? 'bg-accent' : ratio <= 0.4 ? 'bg-warning' : 'bg-danger'
              }`}
              style={{ width: `${Math.min(ratioPercent, 100)}%` }}
              role="presentation"
            />
          </div>
        </div>
      )}

      <p className="mb-4 text-xs text-text3">
        מומלץ: עד 30% מההכנסה הנטו המשותפת
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 px-4 border border-border text-text2 rounded-lg font-medium
            hover:bg-surface active:scale-[0.98] transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
          aria-label="חזור לשלב הקודם"
        >
          ← חזור
        </button>
        <button
          onClick={onNext}
          className="flex-[2] py-3 px-6 bg-primary text-white rounded-lg font-semibold
            hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
          aria-label="המשך לשלב הבא"
        >
          המשך ←
        </button>
      </div>
    </div>
  );
}
