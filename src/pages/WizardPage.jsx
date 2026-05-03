import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../context/WizardContext';
import WizardStepper from '../components/wizard/WizardStepper';
import StepPropertyPrice from '../components/wizard/StepPropertyPrice';
import StepLoanAmount from '../components/wizard/StepLoanAmount';
import StepIncome from '../components/wizard/StepIncome';
import StepRepayment from '../components/wizard/StepRepayment';
import StepFutureFunds from '../components/wizard/StepFutureFunds';
import StepStability from '../components/wizard/StepStability';
import ConsentCheckbox from '../components/wizard/ConsentCheckbox';
import { submitWizard } from '../services/wizardService';
import { Link } from 'react-router-dom';

/**
 * WizardPage - 6-step public mortgage wizard shell.
 * Wraps all steps in WizardProvider for shared state.
 */

const TOTAL_STEPS = 6;

function WizardContent() {
  const navigate = useNavigate();
  const {
    currentStep,
    inputs,
    nextStep,
    prevStep,
    isSubmitting,
    setIsSubmitting,
    submitError,
    setSubmitError,
    setPortfolios,
    setCommunityTips,
  } = useWizard();

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleSubmit = async () => {
    if (!inputs.consent) {
      setSubmitError('Terms of use most be approved.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { inputs: wizardInputs, consent } = inputs;
      const result = await submitWizard(
        {
          propertyPrice: Number(inputs.propertyPrice),
          loanAmount: Number(inputs.loanAmount),
          monthlyIncome: Number(inputs.primaryIncome),
          additionalIncome: Number(inputs.additionalIncome || 0),
          targetRepayment: Number(inputs.targetRepayment),
          futureFunds: {
            timeframe: inputs.futureFunds || 'none',
            amount: Number(inputs.futureFundsAmount || 0),
          },

          stabilityPreference: Number(inputs.stabilityPreference),
        },
        inputs.consent
      );

      setPortfolios(result.portfolios || []);
      setCommunityTips(result.communityTips || []);
      navigate('/wizard/compare');
    } catch (err) {
      setSubmitError(err.message || 'שגיאה בשליחת הנתונים. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepPropertyPrice onNext={nextStep} />;
      case 1:
        return <StepLoanAmount onNext={nextStep} onPrev={prevStep} />;
      case 2:
        return <StepIncome onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <StepRepayment onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <StepFutureFunds onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return (
          <div>
            <StepStability
              onNext={nextStep}
              onPrev={prevStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
            <div className="mt-4">
              <ConsentCheckbox />
            </div>
            {submitError && (
              <div
                role="alert"
                className="mt-3 p-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger font-medium"
                dir="rtl"
              >
                {submitError}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      {/* Navbar */}
      <nav className="bg-white border-b border-border sticky top-0 z-40" role="navigation" aria-label="ניווט ראשי">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="font-bold text-xl text-text1">Morty</span>
            </Link>
            {/* Login button */}
            <Link to="/login"
              className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg
                hover:bg-primary hover:text-white transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              כניסה
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header
        className="bg-gradient-to-br from-primary to-blue-600 text-white py-10 px-4"
        role="banner"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
            גלה את המשכנתא הטובה ביותר עבורך
          </h1>
          <p className="text-lg text-white/80">
            ניתוח AI חינמי. ללא הרשמה.
          </p>
        </div>
      </header>

      {/* Main Wizard Card */}
      <main className="max-w-2xl mx-auto px-4 py-8" id="main-content">
        {/* Progress Stepper */}
        <WizardStepper currentStep={currentStep} />

        {/* Step Counter */}
        <div className="text-sm text-text3 mb-4 text-left" aria-live="polite">
          שלב {currentStep + 1} מתוך {TOTAL_STEPS}
        </div>

        {/* Wizard Card */}
        <div
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,.08), 0 8px 32px rgba(26,60,94,.10)' }}
        >
          {/* Step transition wrapper */}
          <div
            key={currentStep}
            className="wizard-step-enter"
          >
            {renderStep()}
          </div>
        </div>

        {/* Mobile bottom navigation (fixed) */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 py-3 flex items-center justify-between safe-area-inset-bottom z-30">
          <button
            onClick={prevStep}
            disabled={currentStep === 0 || isSubmitting}
            className="px-4 py-2 text-sm font-medium text-text2 disabled:opacity-40 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-border rounded"
            aria-label="חזור לשלב הקודם"
          >
            ← חזור
          </button>
          {/* Step dots */}
          <div className="flex gap-1.5" role="presentation" aria-hidden="true">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < currentStep ? 'bg-accent' : i === currentStep ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <div className="w-16" />{/* Spacer */}
        </div>
      </main>

      {/* Legal Disclaimer Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs text-center py-4 px-6 mt-8">
        Morty הינו כלי תמיכה בהחלטות בלבד ואינו משמש כייעוץ פיננסי מורשה.
        כל המידע מוצג למטרות מידע בלבד. אין להסתמך עליו כתחליף לייעוץ מקצועי.
      </footer>
    </div>
  );
}

export default function WizardPage() {
  return <WizardContent />;
}