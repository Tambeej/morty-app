import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/**
 * WizardContext - manages state for the 6-step public mortgage wizard.
 * Persists to sessionStorage so users don't lose progress on refresh.
 */

const STORAGE_KEY = 'morty_wizard_state';

const defaultInputs = {
  propertyPrice: '',
  loanAmount: '',
  primaryIncome: '',
  additionalIncome: '',
  targetRepayment: 5000,
  futureFunds: 'none',
  futureFundsAmount: '',
  stabilityPreference: 5,
  consent: false,
};

const WizardContext = createContext(null);

export function WizardProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultInputs, ...parsed.inputs };
      }
    } catch {
      // ignore parse errors
    }
    return defaultInputs;
  });
  const [portfolios, setPortfolios] = useState(null);
  const [communityTips, setCommunityTips] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(null);

  // Persist inputs to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, currentStep }));
    } catch {
      // ignore storage errors
    }
  }, [inputs, currentStep]);

  const updateInput = useCallback((field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateInputs = useCallback((updates) => {
    setInputs(prev => ({ ...prev, ...updates }));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const resetWizard = useCallback(() => {
    setInputs(defaultInputs);
    setCurrentStep(0);
    setPortfolios(null);
    setCommunityTips([]);
    setSubmitError(null);
    setSelectedPortfolioId(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = {
    currentStep,
    inputs,
    portfolios,
    communityTips,
    isSubmitting,
    submitError,
    selectedPortfolioId,
    updateInput,
    updateInputs,
    goToStep,
    nextStep,
    prevStep,
    resetWizard,
    setPortfolios,
    setCommunityTips,
    setIsSubmitting,
    setSubmitError,
    setSelectedPortfolioId,
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return ctx;
}

export default WizardContext;
