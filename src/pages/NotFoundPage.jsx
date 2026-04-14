import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <div className="text-8xl font-bold text-gold mb-4">404</div>
        <h1 className="text-2xl font-semibold text-white mb-2">{t('notFound.title')}</h1>
        <p className="text-slate-400 mb-8">{t('notFound.message')}</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-navy font-semibold rounded-input hover:bg-gold-light transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t('notFound.back')}
        </Link>
      </div>
    </div>
  );
}
