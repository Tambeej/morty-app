import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Input from '../components/common/Input.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Spinner from '../components/common/Spinner.jsx';

/**
 * Financial profile form page.
 * Loads existing profile from GET /profile and saves via PUT /profile.
 * Supports auto-save with debounce and manual save.
 */
export default function FinancialProfilePage() {
  const { t } = useTranslation();
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const autoSaveTimer = useRef(null);

  const schema = z.object({
    income:           z.coerce.number().min(0, t('profile.minZero')),
    additionalIncome: z.coerce.number().min(0).optional().default(0),
    housing:          z.coerce.number().min(0).optional().default(0),
    loans:            z.coerce.number().min(0).optional().default(0),
    otherExpenses:    z.coerce.number().min(0).optional().default(0),
    savings:          z.coerce.number().min(0).optional().default(0),
    investments:      z.coerce.number().min(0).optional().default(0)
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema) });

  const watchedValues = watch();
  const completion = calcCompletion(watchedValues);

  // Load existing profile from GET /profile
  useEffect(() => {
    async function load() {
      try {
        const { data: envelope } = await api.get('/profile');
        // Backend returns { data: financialShape } or { data: null }
        const data = envelope?.data || envelope;
        if (data && (data.income !== undefined)) {
          reset({
            income:           data.income || 0,
            additionalIncome: data.additionalIncome || 0,
            housing:          data.expenses?.housing || 0,
            loans:            data.expenses?.loans || 0,
            otherExpenses:    data.expenses?.other || 0,
            savings:          data.assets?.savings || 0,
            investments:      data.assets?.investments || 0
          });
        }
      } catch {
        // No existing profile — start fresh
      } finally {
        setInitialLoading(false);
      }
    }
    load();
  }, [reset]);

  // Auto-save debounce (2 seconds after last change)
  useEffect(() => {
    if (initialLoading) return;
    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await api.put('/profile', buildPayload(watchedValues));
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch {
        // Silent auto-save failure
      }
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  function buildPayload(values) {
    return {
      income:           Number(values.income) || 0,
      additionalIncome: Number(values.additionalIncome) || 0,
      expenses: {
        housing: Number(values.housing) || 0,
        loans:   Number(values.loans) || 0,
        other:   Number(values.otherExpenses) || 0
      },
      assets: {
        savings:     Number(values.savings) || 0,
        investments: Number(values.investments) || 0
      }
    };
  }

  async function onSubmit(values) {
    setSaving(true);
    try {
      await api.put('/profile', buildPayload(values));
      toast.success(t('profile.success'));
    } catch (err) {
      toast.error(err?.response?.data?.message || t('profile.error'));
    } finally {
      setSaving(false);
    }
  }

  if (initialLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f8fafc]">{t('profile.title')}</h1>
          <p className="text-[#94a3b8] mt-1">{t('profile.subtitle')}</p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-[#94a3b8] mb-2">
            <span>{t('profile.completion', { completion })}</span>
            {savedIndicator && <span className="text-green-400 text-xs">{t('profile.saved')}</span>}
          </div>
          <ProgressBar value={completion} label="Profile completion" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Income */}
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">{t('profile.income')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('profile.monthlyIncome')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.income?.message}
                {...register('income')}
              />
              <Input
                label={t('profile.additionalIncome')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.additionalIncome?.message}
                {...register('additionalIncome')}
              />
            </div>
          </Card>

          {/* Expenses */}
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">{t('profile.expenses')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('profile.housing')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.housing?.message}
                {...register('housing')}
              />
              <Input
                label={t('profile.loans')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.loans?.message}
                {...register('loans')}
              />
              <Input
                label={t('profile.otherExpenses')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.otherExpenses?.message}
                {...register('otherExpenses')}
              />
            </div>
          </Card>

          {/* Assets */}
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">{t('profile.assets')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={t('profile.savings')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.savings?.message}
                {...register('savings')}
              />
              <Input
                label={t('profile.investments')}
                type="number"
                min="0"
                prefix="₪"
                error={errors.investments?.message}
                {...register('investments')}
              />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" loading={saving} aria-label={t('profile.save')}>
              {t('profile.save')}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

/**
 * Calculates profile completion percentage based on filled fields.
 */
function calcCompletion(values) {
  const fields = Object.values(values);
  const filled = fields.filter((v) => v && Number(v) > 0).length;
  return Math.round((filled / fields.length) * 100);
}
