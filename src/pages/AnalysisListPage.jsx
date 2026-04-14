/**
 * AnalysisListPage.jsx
 * Lists all mortgage offer analyses for the authenticated user.
 * Route: /analysis
 *
 * Uses GET /offers endpoint (returns OfferShape[] sorted by createdAt desc).
 * Per API contract: GET /offers → { data: OfferShape[] } (flat array)
 * Uses offer.id (Firestore string ID) for keys and navigation.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { formatCurrency, formatDate } from '../utils/formatters';
import { normalizeOfferDoc } from '../utils/firestoreUtils';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatPercent = (value) => {
  if (value == null) return '—';
  return `${Number(value).toFixed(2)}%`;
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

/**
 * Status badge with Firestore-aligned color scheme.
 * Status values: 'pending' | 'analyzed' | 'error' | 'processing'
 */
const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const label = t(`analysisList.statusOptions.${status || 'pending'}`);
  const map = {
    pending:    { cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    processing: { cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    analyzed:   { cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    error:      { cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const { cls } = map[status] || map.pending;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}
    >
      {label}
    </span>
  );
};

// ─── OfferRow ─────────────────────────────────────────────────────────────────

const OfferRow = ({ offer }) => {
  const { t } = useTranslation();
  // Use Firestore string id (normalizeOfferDoc ensures this)
  const offerId = offer.id;
  const { status, extractedData, analysis, createdAt } = offer;

  return (
    <tr className="border-b border-border hover:bg-navy-elevated/40 transition-colors">
      <td className="px-4 py-4">
        <div className="font-medium text-text-primary">
          {extractedData?.bank || t('analysisList.unknownBank')}
        </div>
        {/* formatDate handles ISO strings from Firestore */}
        <div className="text-xs text-text-muted mt-0.5">{formatDate(createdAt)}</div>
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatCurrency(extractedData?.amount)}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatPercent(extractedData?.rate)}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {/* Null-guard: analysis may be null for pending offers */}
        {extractedData?.term ? `${extractedData.term} ${t('analysisList.yr')}` : '—'}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatCurrency(analysis?.savings ?? 0)}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-4 text-right">
        <Link
          to={`/analysis/${offerId}`}
          className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
          aria-label={t('analysisList.viewResults')}
        >
          {t('analysisList.viewResults')}
        </Link>
      </td>
    </tr>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ onUpload }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">📋</span>
      <h2 className="text-xl font-semibold text-text-primary mb-2">{t('analysisList.empty.title')}</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-sm">
        {t('analysisList.empty.description')}
      </p>
      <Button variant="primary" onClick={onUpload} aria-label={t('analysisList.empty.button')}>
        {t('analysisList.empty.button')}
      </Button>
    </div>
  );
};

// ─── SkeletonTable ────────────────────────────────────────────────────────────

const SkeletonTable = () => (
  <div className="space-y-3" aria-busy="true" aria-label="Loading analyses">
    {[...Array(4)].map((_, i) => (
      <Skeleton key={i} className="h-16 rounded-lg" />
    ))}
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

/**
 * AnalysisListPage
 * Displays a table of all mortgage offer analyses.
 *
 * API contract: GET /offers → { data: OfferShape[] } (flat array, sorted createdAt desc)
 * Each offer uses Firestore string `id` and ISO timestamp strings.
 */
const AnalysisListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [offers, setOffers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAnalyses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      // Per API contract: GET /offers returns { data: OfferShape[] } (flat array)
      const response = await api.get('/offers', { params });
      const responseData = response.data?.data;

      if (Array.isArray(responseData)) {
        // Flat array response (primary Firestore API contract)
        // Normalize each offer to ensure string IDs and ISO timestamps
        setOffers(responseData.map(normalizeOfferDoc));
        setPagination(null);
      } else if (responseData && Array.isArray(responseData.offers)) {
        // Paginated response shape (optional)
        setOffers(responseData.offers.map(normalizeOfferDoc));
        setPagination(responseData.pagination || null);
      } else {
        setOffers([]);
        setPagination(null);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || t('analysisList.error.tryAgain');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, showToast, t]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const statusOptions = [
    { value: '', label: t('analysisList.statusOptions.all') },
    { value: 'pending', label: t('analysisList.statusOptions.pending') },
    { value: 'processing', label: t('analysisList.statusOptions.processing') },
    { value: 'analyzed', label: t('analysisList.statusOptions.analyzed') },
    { value: 'error', label: t('analysisList.statusOptions.error') },
  ];

  const tableHeaders = [
    t('analysisList.tableHeaders.bank'),
    t('analysisList.tableHeaders.amount'),
    t('analysisList.tableHeaders.rate'),
    t('analysisList.tableHeaders.term'),
    t('analysisList.tableHeaders.savings'),
    t('analysisList.tableHeaders.status'),
    t('analysisList.tableHeaders.actions')
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('analysisList.title')}</h1>
          <p className="text-text-secondary text-sm mt-1">
            {t('analysisList.subtitle')}
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/upload')}
          aria-label={t('analysisList.uploadNew')}
        >
          {t('analysisList.uploadNew')}
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="status-filter" className="text-text-secondary text-sm font-medium">
          {t('analysisList.filter')}
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-navy-surface border border-border text-text-primary text-sm rounded-input px-3 py-2 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          aria-label={t('analysisList.filter')}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading && <SkeletonTable />}

      {!loading && error && (
        <div
          className="rounded-card bg-red-500/10 border border-red-500/30 p-6 text-center"
          role="alert"
        >
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <Button variant="ghost" onClick={fetchAnalyses}>
            {t('analysisList.error.tryAgain')}
          </Button>
        </div>
      )}

      {!loading && !error && offers.length === 0 && (
        <EmptyState onUpload={() => navigate('/upload')} />
      )}

      {!loading && !error && offers.length > 0 && (
        <>
          <div className="rounded-card bg-navy-surface border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" aria-label={t('analysisList.title')}>
                <thead>
                  <tr className="border-b border-border">
                    {tableHeaders.map(
                      (col, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-label uppercase tracking-widest text-text-secondary"
                        >
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    // Use Firestore string id as key
                    <OfferRow
                      key={offer.id}
                      offer={offer}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div
              className="flex items-center justify-between mt-6"
              role="navigation"
              aria-label="Pagination"
            >
              <p className="text-text-secondary text-sm">
                {t('analysisList.pagination.showing', {
                  start: (pagination.page - 1) * pagination.limit + 1,
                  end: Math.min(pagination.page * pagination.limit, pagination.total),
                  total: pagination.total
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  aria-label={t('analysisList.pagination.prev')}
                >
                  {t('analysisList.pagination.prev')}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  aria-label={t('analysisList.pagination.next')}
                >
                  {t('analysisList.pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisListPage;
