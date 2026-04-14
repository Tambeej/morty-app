import React from 'react';
import { useTranslation } from 'react-i18next';

export default function FullPageSpinner() {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-navy" role="status" aria-label={t('common.loading')}>
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="9 22 9 12 15 12 15 22" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">Morty</span>
      </div>
      <div className="w-10 h-10 rounded-full border-4 border-navy-elevated border-t-gold animate-spin-fast" aria-hidden="true" />
      <p className="mt-4 text-sm text-slate-400">{t('common.loading')}</p>
    </div>
  );
}
