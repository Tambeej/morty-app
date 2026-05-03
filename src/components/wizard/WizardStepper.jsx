import React from 'react';

/**
 * WizardStepper - pill-style progress bar for the 6-step wizard.
 * Shows completed steps in accent green, current in primary navy, future in border gray.
 */

const STEP_LABELS = [
  'מחיר נכס',
  'סכום הלוואה',
  'הכנסה',
  'החזר יעד',
  'כספים עתידיים',
  'יציבות',
];

export default function WizardStepper({ currentStep }) {
  return (
    <div className="w-full mb-8" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={6} aria-label="שלב אשף">
      {/* Step dots / bars */}
      <div className="flex gap-2 mb-3">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'bg-accent'
                : i === currentStep
                ? 'bg-primary'
                : 'bg-border'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      {/* Step labels */}
      <div className="flex gap-2">
        {STEP_LABELS.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-xs transition-colors duration-300 ${
              i < currentStep
                ? 'text-accent font-medium'
                : i === currentStep
                ? 'text-primary font-semibold'
                : 'text-text3'
            }`}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
