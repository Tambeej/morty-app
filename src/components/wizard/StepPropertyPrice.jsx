import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 1 - Property Price (מחיר נכס)
 * Currency input with comma formatting.
 */

function formatCurrency(value) {
  const num = value.replace(/[^\d]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('he-IL');
}

function parseCurrency(value) {
  return value.replace(/[^\d]/g, '');
}

export default function StepPropertyPrice({ onNext }) {
  const { inputs, updateInput } = useWizard();
  const [displayValue, setDisplayValue] = useState(
    inputs.propertyPrice ? formatCurrency(String(inputs.propertyPrice)) : ''
  );
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const raw = parseCurrency(e.target.value);
    const formatted = raw ? formatCurrency(raw) : '';
    setDisplayValue(formatted);
    updateInput('propertyPrice', raw ? Number(raw) : '');
    if (error) setError('');
  };

  const handleNext = () => {
    const val = Number(inputs.propertyPrice);
    if (!val || val < 100000) {
      setError('נא להזין מחיר נכס תקין (מינימום ₪100,000)');
      return;
    }
    if (val > 50000000) {
      setError('מחיר הנכס גבוה מדי');
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">מחיר הנכס</h2>
          <p className="text-sm text-text2">מחיר הרכישה המלא של הנכס</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Input */}
      <div className="mb-4">
        <label htmlFor="propertyPrice" className="block text-sm font-medium text-text2 mb-2">
          מחיר הנכס
        </label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 font-medium select-none">₪</span>
          <input
            id="propertyPrice"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="1,500,000"
            className={`w-full pr-8 pl-4 py-3 rounded-md border text-right font-mono text-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                error
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-white focus:border-primary'
              }`}
            aria-describedby="propertyPrice-hint propertyPrice-error"
            aria-invalid={!!error}
          />
        </div>
        <p id="propertyPrice-hint" className="mt-1.5 text-xs text-text3">
          טווח מקובל: ₪500,000 – ₪5,000,000
        </p>
        {error && (
          <p id="propertyPrice-error" role="alert" className="mt-1.5 text-xs text-danger font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        className="w-full py-3 px-6 bg-primary text-white rounded-lg font-semibold text-base
          hover:bg-primary/90 active:scale-[0.98] transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
        aria-label="המשך לשלב הבא"
      >
        המשך ←
      </button>
    </div>
  );
}
