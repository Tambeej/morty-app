import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import api from '../services/api';

/**
 * Collapsible accordion section for the financial form.
 */
const AccordionSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 bg-navy-surface hover:bg-navy-elevated transition-colors"
        aria-expanded={open}
      >
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-widest">
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 py-5 bg-navy-surface border-t border-border space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * Format number with commas for display.
 */
const formatNumber = (val) => {
  if (!val && val !== 0) return '';
  return Number(val).toLocaleString('he-IL');
};

/**
 * Parse formatted number string back to number.
 */
const parseNumber = (val) => {
  if (!val) return 0;
  return parseFloat(String(val).replace(/,/g, '')) || 0;
};

/**
 * Calculate profile completion percentage.
 */
const calcCompletion = (data) => {
  const fields = [
    data.income,
    data.additionalIncome,
    data.expenses?.housing,
    data.expenses?.loans,
    data.expenses?.other,
    data.assets?.savings,
    data.assets?.investments,
  ];
  const filled = fields.filter((f) => f !== undefined && f !== null && f !== '' && f !== 0).length;
  return Math.round((filled / fields.length) * 100);
};

/**
 * FinancialProfilePage — form for entering/updating financial data.
 * Features: collapsible sections, ₪ prefix, number formatting, auto-save, progress bar.
 */
const FinancialProfilePage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [completion, setCompletion] = useState(0);
  const autoSaveTimer = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      income: '',
      additionalIncome: '',
      expensesHousing: '',
      expensesLoans: '',
      expensesOther: '',
      assetsSavings: '',
      assetsInvestments: '',
    },
  });

  // Watch all fields for completion calculation
  const watchedValues = watch();

  useEffect(() => {
    const mapped = {
      income: parseNumber(watchedValues.income),
      additionalIncome: parseNumber(watchedValues.additionalIncome),
      expenses: {
        housing: parseNumber(watchedValues.expensesHousing),
        loans: parseNumber(watchedValues.expensesLoans),
        other: parseNumber(watchedValues.expensesOther),
      },
      assets: {
        savings: parseNumber(watchedValues.assetsSavings),
        investments: parseNumber(watchedValues.assetsInvestments),
      },
    };
    setCompletion(calcCompletion(mapped));
  }, [watchedValues]);

  // Load existing financial data
  const loadFinancials = useCallback(async () => {
    try {
      const res = await api.get('/profile/financials');
      const data = res.data?.data;
      if (data) {
        reset({
          income: data.income ? formatNumber(data.income) : '',
          additionalIncome: data.additionalIncome ? formatNumber(data.additionalIncome) : '',
          expensesHousing: data.expenses?.housing ? formatNumber(data.expenses.housing) : '',
          expensesLoans: data.expenses?.loans ? formatNumber(data.expenses.loans) : '',
          expensesOther: data.expenses?.other ? formatNumber(data.expenses.other) : '',
          assetsSavings: data.assets?.savings ? formatNumber(data.assets.savings) : '',
          assetsInvestments: data.assets?.investments ? formatNumber(data.assets.investments) : '',
        });
      }
    } catch (err) {
      // 404 means no profile yet — that's fine
      if (err.response?.status !== 404) {
        addToast('Failed to load financial profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [reset, addToast]);

  useEffect(() => {
    loadFinancials();
  }, [loadFinancials]);

  // Auto-save debounce (2s after last change)
  useEffect(() => {
    if (!isDirty || loading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleAutoSave();
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [watchedValues, isDirty, loading]);

  const buildPayload = (data) => ({
    income: parseNumber(data.income),
    additionalIncome: parseNumber(data.additionalIncome),
    expenses: {
      housing: parseNumber(data.expensesHousing),
      loans: parseNumber(data.expensesLoans),
      other: parseNumber(data.expensesOther),
    },
    assets: {
      savings: parseNumber(data.assetsSavings),
      investments: parseNumber(data.assetsInvestments),
    },
  });

  const handleAutoSave = async () => {
    const values = watchedValues;
    try {
      await api.put('/profile/financials', buildPayload(values));
      setSavedIndicator(true);
      setTimeout(() => setSavedIndicator(false), 2000);
    } catch (err) {
      // Silent fail for auto-save
      console.warn('Auto-save failed:', err);
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put('/profile/financials', buildPayload(data));
      addToast('Financial profile saved successfully!', 'success');
      reset(data); // reset dirty state
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save profile. Please try again.';
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton height="32px" width="40%" />
          <Skeleton height="16px" width="60%" />
          <Skeleton height="8px" className="w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="160px" className="w-full" />
          ))}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Financial Profile</h1>
          <p className="text-text-secondary mt-1">
            Keep this updated for accurate mortgage analysis
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <ProgressBar value={completion} label="Profile Completion" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            {/* Income section */}
            <AccordionSection title="Income">
              <Input
                label="Monthly Net Income"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.income?.message}
                {...register('income', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Income cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
              <Input
                label="Additional Income"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.additionalIncome?.message}
                {...register('additionalIncome', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
            </AccordionSection>

            {/* Monthly Expenses section */}
            <AccordionSection title="Monthly Expenses">
              <Input
                label="Housing (rent/mortgage)"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.expensesHousing?.message}
                {...register('expensesHousing', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
              <Input
                label="Existing Loans"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.expensesLoans?.message}
                {...register('expensesLoans', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
              <Input
                label="Other Fixed Expenses"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.expensesOther?.message}
                {...register('expensesOther', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
            </AccordionSection>

            {/* Assets & Savings section */}
            <AccordionSection title="Assets & Savings">
              <Input
                label="Savings / Cash"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.assetsSavings?.message}
                {...register('assetsSavings', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
              <Input
                label="Investments"
                prefix="₪"
                type="text"
                inputMode="numeric"
                placeholder="0"
                error={errors.assetsInvestments?.message}
                {...register('assetsInvestments', {
                  validate: (v) => {
                    const n = parseNumber(v);
                    if (n < 0) return 'Cannot be negative';
                    return true;
                  },
                  onBlur: (e) => {
                    const n = parseNumber(e.target.value);
                    if (n > 0) e.target.value = formatNumber(n);
                  },
                })}
              />
            </AccordionSection>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-6">
            {savedIndicator ? (
              <span className="text-xs text-success flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            ) : (
              <span className="text-xs text-text-muted">
                {isDirty ? 'Unsaved changes' : 'All changes saved'}
              </span>
            )}
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              disabled={saving}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default FinancialProfilePage;
