import React, { useState, useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 2 - Loan Amount (סכום הלוואה)
 * Shows equity and LTV calculation. Warns if LTV > 75%.
 */

function formatCurrency(value) {
  const num = String(value).replace(/[^\d]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('he-IL');
}

function parseCurrency(value) {
  return value.replace(/[^\d]/g, '');
}

export default function StepLoanAmount({ onNext, onPrev }) {
  const { inputs, updateInput } = useWizard();
  const [displayValue, setDisplayValue] = useState(
    inputs.loanAmount ? formatCurrency(String(inputs.loanAmount)) : ''
  );
  const [error, setError] = useState('');

  const propertyPrice = Number(inputs.propertyPrice) || 0;
  const loanAmount = Number(inputs.loanAmount) || 0;

  const equity = useMemo(() => propertyPrice - loanAmount, [propertyPrice, loanAmount]);
  const ltvPercent = useMemo(() => {
    if (!propertyPrice || !loanAmount) return 0;
    return Math.round((loanAmount / propertyPrice) * 100);
  }, [propertyPrice, loanAmount]);

  const showLtvWarning = ltvPercent > 75;

  const handleChange = (e) => {
    const raw = parseCurrency(e.target.value);
    const formatted = raw ? formatCurrency(raw) : '';
    setDisplayValue(formatted);
    updateInput('loanAmount', raw ? Number(raw) : '');
    if (error) setError('');
  };

  const handleNext = () => {
    const val = Number(inputs.loanAmount);
    if (!val || val < 50000) {
      setError('נא להזין סכום הלוואה תקין (מינימום ₪50,000)');
      return;
    }
    if (propertyPrice && val > propertyPrice) {
      setError('סכום ההלוואה לא יכול לעלות על מחיר הנכס');
      return;
    }
    if (ltvPercent > 90) {
      setError('יחס מימון (LTV) מקסימלי הוא 90%');
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">סכום ההלוואה</h2>
          <p className="text-sm text-text2">כמה תצטרך/י לממן דרך המשכנתא?</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Input */}
      <div className="mb-4">
        <label htmlFor="loanAmount" className="block text-sm font-medium text-text2 mb-2">
          סכום ההלוואה
        </label>
        <div className="relative">
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 font-medium select-none">₪</span>
          <input
            id="loanAmount"
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            placeholder="1,000,000"
            className={`w-full pr-8 pl-4 py-3 rounded-md border text-right font-mono text-lg transition-colors
              focus:outline-none focus:ring-2 focus:ring-primary/30
              ${
                error
                  ? 'border-danger bg-danger/5 focus:border-danger'
                  : 'border-border bg-white focus:border-primary'
              }`}
            aria-describedby="loanAmount-hint loanAmount-error"
            aria-invalid={!!error}
          />
        </div>
        {error && (
          <p id="loanAmount-error" role="alert" className="mt-1.5 text-xs text-danger font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Equity Calculation */}
      {loanAmount > 0 && propertyPrice > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-surface border border-border">
          <div className="flex justify-between items-center text-sm">
            <span className="text-text2">הון עצמי:</span>
            <span className="font-mono font-semibold text-text1" dir="ltr">
              ₪{equity.toLocaleString('he-IL')} ({100 - ltvPercent}%)
            </span>
          </div>
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="text-text2">יחס מימון (LTV):</span>
            <span className={`font-mono font-semibold ${ltvPercent > 75 ? 'text-warning' : 'text-accent'}`} dir="ltr">
              {ltvPercent}%
            </span>
          </div>
        </div>
      )}

      {/* LTV Warning */}
      {showLtvWarning && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-warning/10 border border-warning/30 flex items-start gap-2"
        >
          <svg className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-warning font-medium">
            יחס מימון מעל 75% — ייתכן שיידרש ביטוח משכנתא נוסף
          </p>
        </div>
      )}

      <p id="loanAmount-hint" className="mb-4 text-xs text-text3">
        הבנקים בישראל מממנים עד 75% ממחיר הנכס (עד 90% לדירה ראשונה)
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
