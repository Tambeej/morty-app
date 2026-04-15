import React, { useState } from 'react';
import { useWizard } from '../../context/WizardContext';

/**
 * Step 5 - Future Funds (כספים עתידיים)
 * Toggle group with optional amount input.
 */

const FUND_OPTIONS = [
  { value: 'none', label: 'אין כספים' },
  { value: '5years', label: 'בתוך 5 שנים' },
  { value: '10years', label: 'בתוך 10 שנים' },
  { value: '10plus', label: '10+ שנים' },
];

function formatCurrency(value) {
  const num = String(value).replace(/[^\d]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('he-IL');
}

function parseCurrency(value) {
  return value.replace(/[^\d]/g, '');
}

export default function StepFutureFunds({ onNext, onPrev }) {
  const { inputs, updateInput } = useWizard();
  const [amountDisplay, setAmountDisplay] = useState(
    inputs.futureFundsAmount ? formatCurrency(String(inputs.futureFundsAmount)) : ''
  );

  const showAmountInput = inputs.futureFunds !== 'none';

  const handleOptionSelect = (value) => {
    updateInput('futureFunds', value);
    if (value === 'none') {
      updateInput('futureFundsAmount', '');
      setAmountDisplay('');
    }
  };

  const handleAmountChange = (e) => {
    const raw = parseCurrency(e.target.value);
    setAmountDisplay(raw ? formatCurrency(raw) : '');
    updateInput('futureFundsAmount', raw ? Number(raw) : '');
  };

  return (
    <div className="wizard-step" dir="rtl">
      {/* Icon + Title */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text1">כספים עתידיים</h2>
          <p className="text-sm text-text2">ירושה, בונוס, מכירת נכס וכד'</p>
        </div>
      </div>

      <div className="h-px bg-border my-4" />

      {/* Toggle Group */}
      <div className="mb-4">
        <p className="text-sm font-medium text-text2 mb-3">מתי צפויים כספים נוספים?</p>
        <div className="grid grid-cols-2 gap-2" role="group" aria-label="מועד כספים עתידיים">
          {FUND_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`py-2.5 px-4 rounded-full text-sm font-medium transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-1
                ${
                  inputs.futureFunds === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface border border-border text-text2 hover:border-primary/40 hover:bg-primary/5'
                }`}
              aria-pressed={inputs.futureFunds === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional Amount Input */}
      {showAmountInput && (
        <div className="mb-4 animate-fade-in">
          <label htmlFor="futureFundsAmount" className="block text-sm font-medium text-text2 mb-2">
            סכום משוער (אופציונלי)
          </label>
          <div className="relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text3 font-medium select-none">₪</span>
            <input
              id="futureFundsAmount"
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="200,000"
              className="w-full pr-8 pl-4 py-3 rounded-md border border-border bg-white text-right font-mono text-lg
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
        </div>
      )}

      <p className="mb-4 text-xs text-text3">
        מידע זה עוזר לנו להתאים את מסלולי המשכנתא לתזרים העתידי שלך
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
