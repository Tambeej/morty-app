/**
 * FinancialProfilePage.jsx
 * Financial data input form with auto-save and progress indicator.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/validators';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';
import PageLayout from '../components/layout/PageLayout';

const FIELD_GROUPS = [
  {
    id: 'income',
    title: 'INCOME',
    fields: [
      { name: 'income', label: 'Monthly Net Income', path: 'income' },
      { name: 'additionalIncome', label: 'Additional Income', path: 'additionalIncome' },
    ],
  },
  {
    id: 'expenses',
    title: 'MONTHLY EXPENSES',
    fields: [
      { name: 'expenses.housing', label: 'Housing (rent/mortgage)', path: 'expenses.housing' },
      { name: 'expenses.loans', label: 'Existing Loans', path: 'expenses.loans' },
      { name: 'expenses.other', label: 'Other Fixed Expenses', path: 'expenses.other' },
    ],
  },
  {
    id: 'assets',
    title: 'ASSETS & SAVINGS',
    fields: [
      { name: 'assets.savings', label: 'Savings / Cash', path: 'assets.savings' },
      { name: 'assets.investments', label: 'Investments', path: 'assets.investments' },
    ],
  },
];

const ALL_FIELDS = FIELD_GROUPS.flatMap((g) => g.fields.map((f) => f.name));

function computeProgress(values) {
  const filled = ALL_FIELDS.filter((name) => {
    const parts = name.split('.');
    let v = values;
    for (const p of parts) v = v?.[p];
    return v !== '' && v !== undefined && v !== null && !isNaN(Number(v));
  });
  return Math.round((filled.length / ALL_FIELDS.length) * 100);
}

const FinancialProfilePage = () => {
  const { addToast } = useToast();
  const [fetchLoading, setFetchLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [openSections, setOpenSections] = useState({ income: true, expenses: true, assets: true });
  const autoSaveTimer = useRef(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    mode: 'onBlur',
    defaultValues: {
      income: '',
      additionalIncome: '',
      expenses: { housing: '', loans: '', other: '' },
      assets: { savings: '', investments: '' },
    },
  });

  const watchedValues = watch();
  const progress = computeProgress(watchedValues);

  // Fetch existing profile
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/profile/financials');
        const d = res.data.data;
        if (d) {
          reset({
            income: d.income ?? '',
            additionalIncome: d.additionalIncome ?? '',
            expenses: {
              housing: d.expenses?.housing ?? '',
              loans: d.expenses?.loans ?? '',
              other: d.expenses?.other ?? '',
            },
            assets: {
              savings: d.assets?.savings ?? '',
              investments: d.assets?.investments ?? '',
            },
          });
        }
      } catch (err) {
        // 404 means no profile yet — that's fine
        if (err.response?.status !== 404) {
          addToast(extractApiError(err, 'Failed to load profile'), 'error');
        }
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [reset, addToast]);

  const saveProfile = useCallback(
    async (values) => {
      setSaving(true);
      try {
        await api.put('/profile/financials', {
          income: Number(values.income) || 0,
          additionalIncome: Number(values.additionalIncome) || 0,
          expenses: {
            housing: Number(values.expenses?.housing) || 0,
            loans: Number(values.expenses?.loans) || 0,
            other: Number(values.expenses?.other) || 0,
          },
          assets: {
            savings: Number(values.assets?.savings) || 0,
            investments: Number(values.assets?.investments) || 0,
          },
        });
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      } catch (err) {
        addToast(extractApiError(err, 'Failed to save profile'), 'error');
      } finally {
        setSaving(false);
      }
    },
    [addToast]
  );

  // Auto-save debounce
  useEffect(() => {
    if (fetchLoading) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      handleSubmit(saveProfile)();
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [JSON.stringify(watchedValues), fetchLoading]); // eslint-disable-line

  const toggleSection = (id) =>
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));

  const inputStyle = (hasError) => ({
    width: '100%',
    height: '44px',
    background: '#273549',
    border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
    borderRadius: '8px',
    padding: '0 16px 0 40px',
    color: '#f8fafc',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  });

  return (
    <PageLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Financial Profile
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px' }}>
            Keep this updated for accurate analysis
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Profile completeness</span>
            <span style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600 }}>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: '#334155', borderRadius: '2px' }}>
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                borderRadius: '2px',
                transition: 'width 300ms ease',
              }}
            />
          </div>
        </div>

        {fetchLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height="120px" borderRadius="12px" />)}
          </div>
        ) : (
          <form onSubmit={handleSubmit(saveProfile)}>
            {FIELD_GROUPS.map((group) => (
              <div
                key={group.id}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => toggleSection(group.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  aria-expanded={openSections[group.id]}
                >
                  {group.title}
                  <span style={{ fontSize: '0.875rem' }}>
                    {openSections[group.id] ? '▲' : '▼'}
                  </span>
                </button>

                {openSections[group.id] && (
                  <div style={{ padding: '0 20px 20px' }}>
                    {group.fields.map((field) => (
                      <div key={field.name} style={{ marginBottom: '12px' }}>
                        <label
                          htmlFor={field.name}
                          style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.8125rem',
                            marginBottom: '6px',
                          }}
                        >
                          {field.label}
                        </label>
                        <div style={{ position: 'relative' }}>
                          <span
                            style={{
                              position: 'absolute',
                              left: '14px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              color: '#64748b',
                              fontSize: '0.875rem',
                              pointerEvents: 'none',
                            }}
                          >
                            ₪
                          </span>
                          <input
                            id={field.name}
                            type="number"
                            min="0"
                            step="1"
                            {...register(field.name, {
                              min: { value: 0, message: 'Must be 0 or more' },
                            })}
                            style={inputStyle(!!errors[field.name])}
                          />
                        </div>
                        {errors[field.name] && (
                          <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px' }}>
                            {errors[field.name].message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              {savedIndicator && (
                <span style={{ color: '#10b981', fontSize: '0.875rem' }}>✓ Saved</span>
              )}
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: saving ? '#f59e0b66' : '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {saving ? <><Spinner size={16} color="#0f172a" /> Saving...</> : 'Save Profile'}
              </button>
            </div>
          </form>
        )}
      </div>
    </PageLayout>
  );
};

export default FinancialProfilePage;
