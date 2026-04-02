/**
 * FinancialProfilePage - Financial data input form.
 * GET/PUT /api/v1/profile/financials
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';

const financialSchema = z.object({
  income: z.coerce.number().min(0, 'Must be 0 or more'),
  additionalIncome: z.coerce.number().min(0, 'Must be 0 or more'),
  expensesHousing: z.coerce.number().min(0, 'Must be 0 or more'),
  expensesLoans: z.coerce.number().min(0, 'Must be 0 or more'),
  expensesOther: z.coerce.number().min(0, 'Must be 0 or more'),
  assetsSavings: z.coerce.number().min(0, 'Must be 0 or more'),
  assetsInvestments: z.coerce.number().min(0, 'Must be 0 or more'),
});

export default function FinancialProfilePage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const autoSaveTimer = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(financialSchema),
    defaultValues: {
      income: 0,
      additionalIncome: 0,
      expensesHousing: 0,
      expensesLoans: 0,
      expensesOther: 0,
      assetsSavings: 0,
      assetsInvestments: 0,
    },
  });

  // Load existing profile
  useEffect(() => {
    api
      .get('/profile/financials')
      .then((res) => {
        const d = res.data.data;
        if (d) {
          reset({
            income: d.income || 0,
            additionalIncome: d.additionalIncome || 0,
            expensesHousing: d.expenses?.housing || 0,
            expensesLoans: d.expenses?.loans || 0,
            expensesOther: d.expenses?.other || 0,
            assetsSavings: d.assets?.savings || 0,
            assetsInvestments: d.assets?.investments || 0,
          });
        }
      })
      .catch(() => {
        // No profile yet — use defaults
      })
      .finally(() => setLoading(false));
  }, [reset]);

  const saveData = useCallback(
    async (data) => {
      setSaving(true);
      try {
        await api.put('/profile/financials', {
          income: data.income,
          additionalIncome: data.additionalIncome,
          expenses: {
            housing: data.expensesHousing,
            loans: data.expensesLoans,
            other: data.expensesOther,
          },
          assets: {
            savings: data.assetsSavings,
            investments: data.assetsInvestments,
          },
        });
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch (err) {
        const message = err?.response?.data?.error || 'Failed to save profile.';
        addToast(message, 'error');
      } finally {
        setSaving(false);
      }
    },
    [addToast]
  );

  // Auto-save debounce
  const watchedValues = watch();
  useEffect(() => {
    if (!isDirty) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSubmit(saveData)();
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [watchedValues, isDirty, handleSubmit, saveData]);

  // Calculate profile completeness
  const values = watch();
  const filledFields = Object.values(values).filter((v) => Number(v) > 0).length;
  const totalFields = Object.keys(values).length;
  const completeness = Math.round((filledFields / totalFields) * 100);

  const formatNumber = (val) =>
    val ? new Intl.NumberFormat('he-IL').format(val) : '';

  const inputStyle = (hasError) => ({
    background: '#1e293b',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    borderRadius: '8px',
    color: '#f8fafc',
    height: '44px',
    padding: '0 16px 0 40px',
    width: '100%',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  });

  return (
    <PageLayout>
      <div className="page-enter max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#f8fafc' }}>
            Financial Profile
          </h1>
          <p className="mt-1" style={{ color: '#94a3b8' }}>
            Keep this updated for accurate analysis
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: '#94a3b8' }}>
              Profile {completeness}% complete
            </span>
            {savedIndicator && (
              <span className="text-xs flex items-center gap-1" style={{ color: '#10b981' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completeness}%` }} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-card p-6" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-11 w-full" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit(saveData)} noValidate>
            {/* Income Section */}
            <Section title="INCOME">
              <NumberField
                id="income"
                label="Monthly Net Income"
                error={errors.income}
                inputStyle={inputStyle}
                register={register('income')}
              />
              <NumberField
                id="additionalIncome"
                label="Additional Income"
                error={errors.additionalIncome}
                inputStyle={inputStyle}
                register={register('additionalIncome')}
              />
            </Section>

            {/* Expenses Section */}
            <Section title="MONTHLY EXPENSES">
              <NumberField
                id="expensesHousing"
                label="Housing (rent/mortgage)"
                error={errors.expensesHousing}
                inputStyle={inputStyle}
                register={register('expensesHousing')}
              />
              <NumberField
                id="expensesLoans"
                label="Existing Loans"
                error={errors.expensesLoans}
                inputStyle={inputStyle}
                register={register('expensesLoans')}
              />
              <NumberField
                id="expensesOther"
                label="Other Fixed Expenses"
                error={errors.expensesOther}
                inputStyle={inputStyle}
                register={register('expensesOther')}
              />
            </Section>

            {/* Assets Section */}
            <Section title="ASSETS & SAVINGS">
              <NumberField
                id="assetsSavings"
                label="Savings / Cash"
                error={errors.assetsSavings}
                inputStyle={inputStyle}
                register={register('assetsSavings')}
              />
              <NumberField
                id="assetsInvestments"
                label="Investments"
                error={errors.assetsInvestments}
                inputStyle={inputStyle}
                register={register('assetsInvestments')}
              />
            </Section>

            {/* Save Button */}
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 font-semibold px-6 py-3 transition-all"
                style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => { if (!saving) e.currentTarget.style.background = '#fbbf24'; }}
                onMouseLeave={(e) => { if (!saving) e.currentTarget.style.background = '#f59e0b'; }}
              >
                {saving ? <><Spinner size={18} /><span>Saving...</span></> : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
}

function Section({ title, children }) {
  return (
    <div
      className="rounded-card p-6 mb-6"
      style={{ background: '#1e293b', border: '1px solid #334155' }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: '#64748b' }}
      >
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function NumberField({ id, label, error, inputStyle, register }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm mb-2"
        style={{ color: '#94a3b8' }}
      >
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
          style={{ color: '#64748b' }}
          aria-hidden="true"
        >
          ₪
        </span>
        <input
          id={id}
          type="number"
          min="0"
          step="100"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          style={inputStyle(!!error)}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.2)';
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'none';
            }
          }}
          {...register}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs" style={{ color: '#ef4444' }}>
          {error.message}
        </p>
      )}
    </div>
  );
}
