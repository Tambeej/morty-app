import React from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 6 - Stability Preference (העדפת יציבות)
 * Slider 1-10 with 3-zone color bar.
 * Score >= 7 triggers Stability-First scenario.
 */

function getZoneInfo(value) {
  if (value <= 3) return { label: 'גמישות מקסימלית', color: 'text-accent', zone: 'flexible' };
  if (value <= 6) return { label: 'איזון', color: 'text-warning', zone: 'balanced' };
  return { label: 'יציבות מקסימלית', color: 'text-primary', zone: 'stable' };
}

export default function StepStability({ onNext, onPrev, onSubmit, isSubmitting }) {
  const { inputs, updateInput } = useWizard();
  const stability = inputs.stabilityPreference || 5;
  const { label: zoneLabel, color: zoneColor } = getZoneInfo(stability);
  const triggersStabilityFirst = stability >= 7;

  const sliderPercent = ((stability - 1) / 9) * 100;

  const handleChange = (e) => {
    updateInput('stabilityPreference', Number(e.target.value));
  };

  return (
    <div className="wizard-step" dir="rtl">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">העדפת יציבות</h2>
          <p className="text-sm text-text2">עד כמה חשובה לך ריבית קבועה?</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Score display */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-primary" aria-live="polite" aria-atomic="true">
          {stability}
        </div>
        <div className={`text-sm font-medium mt-1 ${zoneColor}`}>{zoneLabel}</div>
      </div>

      {/* 3-zone color bar */}
      <div className="mb-3 h-3 rounded-full overflow-hidden flex" role="presentation" aria-hidden="true">
        <div className="flex-1 bg-accent" />
        <div className="flex-1 bg-warning" />
        <div className="flex-1 bg-primary" />
      </div>
      <div className="flex justify-between text-xs text-text3 mb-4">
        <span>גמישות</span>
        <span>איזון</span>
        <span>יציבות</span>
      </div>

      {/* Slider */}
      <div className="mb-4">
        <label htmlFor="stabilityPreference" className="sr-only">העדפת יציבות 1-10</label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text3 whitespace-nowrap">גמישות</span>
          <input
            id="stabilityPreference"
            type="range"
            min={1}
            max={10}
            step={1}
            value={stability}
            onChange={handleChange}
            className="flex-1 h-2 rounded-full appearance-none cursor-pointer wizard-slider"
            style={{
              background: `linear-gradient(to right, #1A3C5E ${sliderPercent}%, #E2E8F0 ${sliderPercent}%)`,
            }}
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={stability}
            aria-valuetext={`${stability} — ${zoneLabel}`}
          />
          <span className="text-xs text-text3 whitespace-nowrap">יציבות</span>
        </div>
        {/* Tick marks */}
        <div className="flex justify-between px-1 mt-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <span key={n} className={`text-xs ${n === stability ? 'text-primary font-bold' : 'text-text3'}`}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Stability-First trigger note */}
      {triggersStabilityFirst && (
        <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2">
          <svg className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-primary font-medium">
            ציון 7+ מפעיל תיק "יציבות קודם" — תיק עם ריבית קבועה גבוהה
          </p>
        </div>
      )}

      <p className="mb-4 text-xs text-text3">
        ריבית משתנה עשויה להיות זולה יותר אך כרוכה בסיכון. ריבית קבועה מספקת ודאות.
      </p>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 px-4 border border-border text-text2 rounded-lg font-medium
            hover:bg-surface active:scale-[0.98] transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-border focus:ring-offset-2"
          aria-label="חזור לשלב הקודם"
          disabled={isSubmitting}
        >
          ← חזור
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-[2] py-3 px-6 bg-accent text-white rounded-lg font-semibold
            hover:bg-accent/90 active:scale-[0.98] transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-accent/40 focus:ring-offset-2
            disabled:opacity-60 disabled:cursor-not-allowed"
          aria-label="שלח וקבל תיקי משכנתא"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              מחשב...
            </span>
          ) : (
            'קבל את התיקים שלי ←'
          )}
        </button>
      </div>
    </div>
  );
}
