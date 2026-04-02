/**
 * Financial Profile Page
 * Form for entering income, expenses, and assets
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { getFinancialProfile, updateFinancialProfile } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ProgressBar from '../components/common/ProgressBar';
import Skeleton from '../components/common/Skeleton';

const financialSchema = z.object({
  income: z.object({
    monthly: z.coerce.number().min(0, 'Must be a positive number'),
    additional: z.coerce.number().min(0).optional().default(0),
  }),
  expenses: z.object({
    housing: z.coerce.number().min(0).optional().default(0),
    loans: z.coerce.number().min(0).optional().default(0),
    other: z.coerce.number().min(0).optional().default(0),
  }),
  assets: z.object({
    savings: z.coerce.number().min(0).optional().default(0),
    investments: z.coerce.number().min(0).optional().default(0),
  }),
});

function SectionHeader({ title, isOpen, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full py-3 text-left rtl:text-right"
    >
      <span className="text-xs font-semibold uppercase tracking-widest text-gold">
        {title}
      </span>
      <svg
        className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

function FinancialProfilePage() {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [openSections, setOpenSections] = useState({
    income: true,
    expenses: true,
    assets: true,
  });

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
      income: { monthly: 0, additional: 0 },
      expenses: { housing: 0, loans: 0, other: 0 },
      assets: { savings: 0, investments: 0 },
    },
  });

  // Load existing profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getFinancialProfile();
        if (res.data) {
          reset({
            income: {
              monthly: res.data.income || 0,
              additional: res.data.additionalIncome || 0,
            },
            expenses: {
              housing: res.data.expenses?.housing || 0,
              loans: res.data.expenses?.loans || 0,
              other: res.data.expenses?.other || 0,
            },
            assets: {
              savings: res.data.assets?.savings || 0,
              investments: res.data.assets?.investments || 0,
            },
          });
        }
      } catch (err) {
        // Profile may not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset]);

  // Calculate profile completion percentage
  const watchedValues = watch();
  const calculateCompletion = useCallback(() => {
    const fields = [
      watchedValues.income?.monthly,
      watchedValues.income?.additional,
      watchedValues.expenses?.housing,
      watchedValues.expenses?.loans,
      watchedValues.expenses?.other,
      watchedValues.assets?.savings,
      watchedValues.assets?.investments,
    ];
    const filled = fields.filter((v) => v && Number(v) > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [watchedValues]);

  const onSubmit = async (data) => {
    setSaveStatus('saving');
    try {
      await updateFinancialProfile({
        income: data.income.monthly,
        additionalIncome: data.income.additional,
        expenses: data.expenses,
        assets: data.assets,
      });
      setSaveStatus('saved');
      success(t('financial.saved'));
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('idle');
      showError(err.response?.data?.message || 'Failed to save profile');
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num) || num === 0) return '';
    return num.toLocaleString('he-IL');
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-2xl">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-8" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">{t('financial.title')}</h1>
          <p className="text-text-secondary mt-1">{t('financial.subtitle')}</p>
        </div>

        {/* Progress */}
        <ProgressBar
          value={calculateCompletion()}
          label={t('financial.profileComplete', { percent: calculateCompletion() })}
          className="mb-8"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Income Section */}
          <Card>
            <SectionHeader
              title={t('financial.income')}
              isOpen={openSections.income}
              onToggle={() => toggleSection('income')}
            />
            {openSections.income && (
              <div className="space-y-4 pt-2">
                <Input
                  label={t('financial.monthlyIncome')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.income?.monthly?.message}
                  {...register('income.monthly')}
                />
                <Input
                  label={t('financial.additionalIncome')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.income?.additional?.message}
                  {...register('income.additional')}
                />
              </div>
            )}
          </Card>

          {/* Expenses Section */}
          <Card>
            <SectionHeader
              title={t('financial.expenses')}
              isOpen={openSections.expenses}
              onToggle={() => toggleSection('expenses')}
            />
            {openSections.expenses && (
              <div className="space-y-4 pt-2">
                <Input
                  label={t('financial.housing')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.expenses?.housing?.message}
                  {...register('expenses.housing')}
                />
                <Input
                  label={t('financial.loans')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.expenses?.loans?.message}
                  {...register('expenses.loans')}
                />
                <Input
                  label={t('financial.other')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.expenses?.other?.message}
                  {...register('expenses.other')}
                />
              </div>
            )}
          </Card>

          {/* Assets Section */}
          <Card>
            <SectionHeader
              title={t('financial.assets')}
              isOpen={openSections.assets}
              onToggle={() => toggleSection('assets')}
            />
            {openSections.assets && (
              <div className="space-y-4 pt-2">
                <Input
                  label={t('financial.savings')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.assets?.savings?.message}
                  {...register('assets.savings')}
                />
                <Input
                  label={t('financial.investments')}
                  type="number"
                  prefix="₪"
                  placeholder="0"
                  error={errors.assets?.investments?.message}
                  {...register('assets.investments')}
                />
              </div>
            )}
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={saveStatus === 'saving'}
              className="min-w-32"
            >
              {saveStatus === 'saved'
                ? `✓ ${t('financial.saved')}`
                : saveStatus === 'saving'
                ? t('financial.saving')
                : t('financial.saveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

export default FinancialProfilePage;
