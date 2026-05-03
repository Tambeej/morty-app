import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 3 - Monthly Income (הכנסה חודשית)
 * Two fields: primary income + optional additional income.
 */

function formatCurrency(value) {
  const num = String(value).replace(/[^\d]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('he-IL');
}

function parseCurrency(value) {
  return value.replace(/[^\d]/g, '');
}

export default function StepIncome({ onNext, onPrev }) {
  const { inputs, updateInput } = useWizard();
  const [primaryDisplay, setPrimaryDisplay] = useState(
    inputs.primaryIncome ? formatCurrency(String(inputs.primaryIncome)) : ''
  );
  const [additionalDisplay, setAdditionalDisplay] = useState(
    inputs.additionalIncome ? formatCurrency(String(inputs.additionalIncome)) : ''
  );
  const [error, setError] = useState('');

  const totalIncome = (Number(inputs.primaryIncome) || 0) + (Number(inputs.additionalIncome) || 0);

  const handlePrimaryChange = (e) => {
    const raw = parseCurrency(e.target.value);
    setPrimaryDisplay(raw ? formatCurrency(raw) : '');
    updateInput('primaryIncome', raw ? Number(raw) : '');
    if (error) setError('');
  };

  const handleAdditionalChange = (e) => {
    const raw = parseCurrency(e.target.value);
    setAdditionalDisplay(raw ? formatCurrency(raw) : '');
    updateInput('additionalIncome', raw ? Number(raw) : '');
  };

  const handleNext = () => {
    const primary = Number(inputs.primaryIncome);
    if (!primary || primary < 1000) {
      setError('נא להזין הכנסה עיקרית תקינה (מינימום ₪1,000)');
      return;
    }
    onNext();
  };

  return (
    <div className="wizard-step" dir="rtl">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">הכנסה חודשית</h2>
          <p className="text-sm text-text2">הכנסה נטו משותפת של כל הלווים</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Primary Income */}
      <div className="mb-4">
        <label htmlFor="primaryIncome" className="block text-sm font-medium text-text2 mb-2">
          הכנסה עיקרית <span className="text-danger">*</span>
        </label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 font-medium select-none">₪</span>
          <input
            id="primaryIncome"
            type="text"
            inputMode="numeric"
            value={primaryDisplay}
            onChange={handlePrimaryChange}
            placeholder="15,000"
            className={`w-full pr-8 pl-4 py-3 rounded-md border text-right font-mono text-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                error
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-white focus:border-primary'
              }`}
            aria-describedby="primaryIncome-error"
            aria-invalid={!!error}
            aria-required="true"
          />
        </div>
        {error && (
          <p id="primaryIncome-error" role="alert" className="mt-1.5 text-xs text-danger font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Additional Income */}
      <div className="mb-4">
        <label htmlFor="additionalIncome" className="block text-sm font-medium text-text2 mb-2">
          הכנסה נוספת
          <span className="mr-2 text-xs text-text3 font-normal">(אופציונלי)</span>
        </label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 font-medium select-none">₪</span>
          <input
            id="additionalIncome"
            type="text"
            inputMode="numeric"
            value={additionalDisplay}
            onChange={handleAdditionalChange}
            placeholder="5,000"
            className="w-full pr-8 pl-4 py-3 rounded-md border border-border bg-white text-right font-mono text-lg
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Total Income Display */}
      {totalIncome > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text2">סה"כ הכנסה משותפת:</span>
            <span className="font-mono font-bold text-accent" dir="ltr">
              ₪{totalIncome.toLocaleString('he-IL')}
            </span>
          </div>
        </div>
      )}

      <p className="mb-4 text-xs text-text3">
        הכנסה נטו לאחר מס — כולל כל הלווים יחד
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
          onClick={handleNext}
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
