/**
 * Financial Profile Page
 * Form for entering and updating user financial data
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '../context/ToastContext';
import { getFinancials, updateFinancials } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';

// Validation schema
const financialSchema = z.object({
  income: z.object({
    monthly: z.coerce.number().min(0, 'Must be a positive number'),
    additional: z.coerce.number().min(0, 'Must be a positive number').optional(),
  }),
  expenses: z.object({
    housing: z.coerce.number().min(0, 'Must be a positive number'),
    loans: z.coerce.number().min(0, 'Must be a positive number'),
    other: z.coerce.number().min(0, 'Must be a positive number'),
  }),
  assets: z.object({
    savings: z.coerce.number().min(0, 'Must be a positive number'),
    investments: z.coerce.number().min(0, 'Must be a positive number'),
  }),
});

/**
 * Section Header with collapse toggle
 */
const SectionHeader = ({ title, isOpen, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-3 text-left"
    aria-expanded={isOpen}
  >
    <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
      {title}
    </span>
    <svg
      className={`w-4 h-4 text-[#64748b] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

/**
 * Calculate profile completion percentage
 */
function calculateCompletion(values) {
  const fields = [
    values?.income?.monthly,
    values?.income?.additional,
    values?.expenses?.housing,
    values?.expenses?.loans,
    values?.expenses?.other,
    values?.assets?.savings,
    values?.assets?.investments,
  ];
  const filled = fields.filter((v) => v !== undefined && v !== null && v !== '' && v !== 0).length;
  return Math.round((filled / fields.length) * 100);
}

/**
 * Financial Profile Page Component
 */
const FinancialProfilePage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [sections, setSections] = useState({
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

  const watchedValues = watch();
  const completion = calculateCompletion(watchedValues);

  // Load existing financial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getFinancials();
        if (response.data) {
          reset(response.data);
        }
      } catch (error) {
        // No existing data - use defaults
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [reset]);

  // Auto-save debounce
  useEffect(() => {
    if (!isDirty || loading) return;

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    autoSaveTimer.current = setTimeout(async () => {
      try {
        await updateFinancials(watchedValues);
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch {
        // Silent auto-save failure
      }
    }, 2000);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [watchedValues, isDirty, loading]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await updateFinancials(data);
      toast.success('Financial profile saved successfully!');
      reset(data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">Financial Profile</h1>
        <p className="text-[#94a3b8]">
          Keep this updated for accurate mortgage analysis
        </p>
      </div>

      {/* Profile Completion */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#f8fafc]">
            Profile Completion
          </span>
          <div className="flex items-center gap-2">
            {savedIndicator && (
              <span className="text-xs text-success animate-fade-in">Saved ✓</span>
            )}
            <span className="text-sm font-semibold text-gold">{completion}%</span>
          </div>
        </div>
        <ProgressBar value={completion} label="Profile completion" />
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Income Section */}
        <Card className="mb-4">
          <SectionHeader
            title="Income"
            isOpen={sections.income}
            onToggle={() => toggleSection('income')}
          />
          {sections.income && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                label="Monthly Net Income"
                type="number"
                prefix="₪"
                placeholder="0"
                error={errors.income?.monthly?.message}
                {...register('income.monthly')}
              />
              <Input
                label="Additional Income"
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
        <Card className="mb-4">
          <SectionHeader
            title="Monthly Expenses"
            isOpen={sections.expenses}
            onToggle={() => toggleSection('expenses')}
          />
          {sections.expenses && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <Input
                label="Housing (rent/mortgage)"
                type="number"
                prefix="₪"
                placeholder="0"
                error={errors.expenses?.housing?.message}
                {...register('expenses.housing')}
              />
              <Input
                label="Existing Loans"
                type="number"
                prefix="₪"
                placeholder="0"
                error={errors.expenses?.loans?.message}
                {...register('expenses.loans')}
              />
              <Input
                label="Other Fixed Expenses"
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
        <Card className="mb-6">
          <SectionHeader
            title="Assets & Savings"
            isOpen={sections.assets}
            onToggle={() => toggleSection('assets')}
          />
          {sections.assets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Input
                label="Savings / Cash"
                type="number"
                prefix="₪"
                placeholder="0"
                error={errors.assets?.savings?.message}
                {...register('assets.savings')}
              />
              <Input
                label="Investments"
                type="number"
                prefix="₪"
                placeholder="0"
                error={errors.assets?.investments?.message}
                {...register('assets.investments')}
              />
            </div>
          )}
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={!isDirty}
          >
            Save Profile
          </Button>
        </div>
      </form>
    </PageLayout>
  );
};

export default FinancialProfilePage;
