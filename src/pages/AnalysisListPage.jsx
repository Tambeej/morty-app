/**
 * AnalysisListPage.jsx
 * Lists all mortgage offer analyses for the authenticated user.
 * Route: /analysis
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatPercent = (value) => {
  if (value == null) return '—';
  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    pending:    { label: 'Pending',    cls: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    processing: { label: 'Processing', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    analyzed:   { label: 'Analyzed',   cls: 'bg-green-500/20 text-green-400 border-green-500/30' },
    error:      { label: 'Error',      cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const { label, cls } = map[status] || map.pending;
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
  const { id, status, extractedData, analysis, createdAt } = offer;

  return (
    <tr className="border-b border-border hover:bg-navy-elevated/40 transition-colors">
      <td className="px-4 py-4">
        <div className="font-medium text-text-primary">
          {extractedData?.bank || 'Unknown Bank'}
        </div>
        <div className="text-xs text-text-muted mt-0.5">{formatDate(createdAt)}</div>
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatCurrency(extractedData?.amount)}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatPercent(extractedData?.rate)}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {extractedData?.term ? `${extractedData.term} yr` : '—'}
      </td>
      <td className="px-4 py-4 text-text-secondary text-sm">
        {formatCurrency(analysis?.savings)}
      </td>
      <td className="px-4 py-4">
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-4 text-right">
        <Link
          to={`/analysis/${id}`}
          className="text-gold hover:text-gold-light text-sm font-medium transition-colors"
          aria-label={`View analysis for ${extractedData?.bank || 'offer'}`}
        >
          View Results →
        </Link>
      </td>
    </tr>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

const EmptyState = ({ onUpload }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4" aria-hidden="true">📋</span>
    <h2 className="text-xl font-semibold text-text-primary mb-2">No analyses yet</h2>
    <p className="text-text-secondary text-sm mb-6 max-w-sm">
      Upload your first mortgage offer to get AI-powered analysis and recommendations.
    </p>
    <Button variant="primary" onClick={onUpload} aria-label="Upload a mortgage offer">
      Upload Mortgage Offer
    </Button>
  </div>
);

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
 * Displays a paginated table of all mortgage offer analyses.
 */
const AnalysisListPage = () => {
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
      const response = await api.get('/analysis', { params });
      setOffers(response.data.data.offers || []);
      setPagination(response.data.data.pagination || null);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load analyses.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, showToast]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'analyzed', label: 'Analyzed' },
    { value: 'error', label: 'Error' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Mortgage Analyses</h1>
          <p className="text-text-secondary text-sm mt-1">
            AI-powered analysis of your uploaded mortgage offers
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/upload')}
          aria-label="Upload a new mortgage offer"
        >
          + Upload New Offer
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="status-filter" className="text-text-secondary text-sm font-medium">
          Filter:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-navy-surface border border-border text-text-primary text-sm rounded-input px-3 py-2 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          aria-label="Filter analyses by status"
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
            Try Again
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
              <table className="w-full" aria-label="Mortgage analyses table">
                <thead>
                  <tr className="border-b border-border">
                    {['Bank', 'Amount', 'Rate', 'Term', 'Potential Savings', 'Status', ''].map(
                      (col) => (
                        <th
                          key={col}
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
                    <OfferRow key={offer.id || offer._id} offer={{ ...offer, id: offer.id || offer._id }} />
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
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPrev}
                  aria-label="Previous page"
                >
                  ← Prev
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  aria-label="Next page"
                >
                  Next →
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
