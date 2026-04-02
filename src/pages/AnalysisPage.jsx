/**
 * AnalysisPage.jsx
 * Displays detailed AI-powered mortgage analysis results for a single offer.
 * Fetches data from GET /api/v1/analysis/:id and supports real-time SSE updates.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import useAnalysisStream from '../hooks/useAnalysisStream';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Format a number as Israeli currency (₪).
 * @param {number} value
 * @returns {string}
 */
const formatCurrency = (value) => {
  if (value == null) return '—';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a percentage value.
 * @param {number} value
 * @returns {string}
 */
const formatPercent = (value) => {
  if (value == null) return '—';
  return `${Number(value).toFixed(2)}%`;
};

/**
 * Generate monthly payment data points for the comparison chart.
 * Uses a simple amortisation formula.
 * @param {number} principal  Loan amount in ILS
 * @param {number} annualRate Annual interest rate (e.g. 3.8 for 3.8%)
 * @param {number} termYears  Loan term in years
 * @returns {number[]} Array of cumulative payments per month
 */
const buildAmortisationSeries = (principal, annualRate, termYears) => {
  if (!principal || !annualRate || !termYears) return [];
  const months = termYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);

  const series = [];
  let balance = principal;
  let cumulative = 0;
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = payment - interest;
    balance -= principalPaid;
    cumulative += payment;
    // Sample every 12 months to keep chart readable
    if (m % 12 === 0) {
      series.push(Math.round(cumulative));
    }
  }
  return series;
};

/**
 * Build chart data array for Recharts from analysis data.
 */
const buildChartData = (extractedData, analysis) => {
  if (!extractedData || !analysis) return [];

  const { amount, rate, term } = extractedData;
  const { recommendedRate, marketAverageRate } = analysis;

  const yourSeries = buildAmortisationSeries(amount, rate, term);
  const marketSeries = buildAmortisationSeries(amount, marketAverageRate || rate * 0.95, term);
  const mortySeriesRaw = buildAmortisationSeries(amount, recommendedRate || rate * 0.9, term);

  return yourSeries.map((val, idx) => ({
    year: idx + 1,
    yourOffer: val,
    marketBest: marketSeries[idx] ?? null,
    mortyRec: mortySeriesRaw[idx] ?? null,
  }));
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/**
 * StatusBadge — coloured pill showing offer analysis status.
 */
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

/**
 * AISummaryCard — gold-bordered card with AI reasoning text.
 */
const AISummaryCard = ({ reasoning }) => (
  <div
    className="rounded-card bg-navy-surface border border-border p-6 mb-6"
    style={{ borderTop: '3px solid #f59e0b' }}
    role="region"
    aria-label="AI Analysis Summary"
  >
    <div className="flex items-start gap-3">
      <span className="text-2xl" aria-hidden="true">🤖</span>
      <div>
        <h2 className="text-sm font-label uppercase tracking-widest text-gold mb-2">
          AI Summary
        </h2>
        <p className="text-text-primary leading-relaxed">{reasoning}</p>
      </div>
    </div>
  </div>
);

/**
 * TermsTable — displays extracted mortgage terms in a clean table.
 */
const TermsTable = ({ extractedData, analysis }) => {
  const rows = [
    { label: 'Bank',            value: extractedData?.bank || '—' },
    { label: 'Loan Amount',     value: formatCurrency(extractedData?.amount) },
    { label: 'Interest Rate',   value: formatPercent(extractedData?.rate) },
    { label: 'Term',            value: extractedData?.term ? `${extractedData.term} years` : '—' },
    { label: 'Monthly Payment', value: formatCurrency(analysis?.monthlyPayment) },
    { label: 'Total Cost',      value: formatCurrency(analysis?.totalCost) },
    { label: 'Total Interest',  value: formatCurrency(analysis?.totalInterest) },
  ];

  return (
    <div
      className="rounded-card bg-navy-surface border border-border overflow-hidden mb-6"
      role="region"
      aria-label="Extracted Mortgage Terms"
    >
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-label uppercase tracking-widest text-text-secondary">
          Extracted Terms
        </h2>
      </div>
      <table className="w-full" aria-label="Mortgage offer terms">
        <tbody>
          {rows.map(({ label, value }, idx) => (
            <tr
              key={label}
              className={idx % 2 === 0 ? 'bg-navy-elevated/30' : ''}
            >
              <td className="px-6 py-3 text-text-secondary text-sm font-medium w-1/2">
                {label}
              </td>
              <td className="px-6 py-3 text-text-primary text-sm font-semibold">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * MetricsRow — three stat cards: recommended rate, potential savings, affordability.
 */
const MetricsRow = ({ analysis }) => {
  const metrics = [
    {
      icon: '📉',
      label: 'Recommended Rate',
      value: formatPercent(analysis?.recommendedRate),
      sub: analysis?.rateVsMarket != null
        ? `${analysis.rateVsMarket > 0 ? '+' : ''}${formatPercent(analysis.rateVsMarket)} vs market`
        : null,
      highlight: true,
    },
    {
      icon: '💰',
      label: 'Potential Savings',
      value: formatCurrency(analysis?.savings),
      sub: 'over loan lifetime',
      highlight: false,
    },
    {
      icon: '📊',
      label: 'Affordability Score',
      value: analysis?.affordabilityScore != null
        ? `${analysis.affordabilityScore}/100`
        : '—',
      sub: analysis?.debtToIncomeRatio != null
        ? `DTI: ${(analysis.debtToIncomeRatio * 100).toFixed(1)}%`
        : null,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {metrics.map(({ icon, label, value, sub, highlight }) => (
        <div
          key={label}
          className="stat-card rounded-card bg-navy-surface border border-border p-6"
          style={highlight ? { borderTop: '3px solid #f59e0b' } : {}}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl" aria-hidden="true">{icon}</span>
            <span className="text-xs font-label uppercase tracking-widest text-text-secondary">
              {label}
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
        </div>
      ))}
    </div>
  );
};

/**
 * ComparisonChart — Recharts LineChart comparing cumulative payments.
 */
const ComparisonChart = ({ chartData }) => {
  if (!chartData || chartData.length === 0) return null;

  const formatYAxis = (val) =>
    val >= 1_000_000
      ? `₪${(val / 1_000_000).toFixed(1)}M`
      : `₪${(val / 1_000).toFixed(0)}K`;

  return (
    <div
      className="rounded-card bg-navy-surface border border-border p-6 mb-6"
      role="region"
      aria-label="Payment Comparison Chart"
    >
      <h2 className="text-sm font-label uppercase tracking-widest text-text-secondary mb-4">
        Cumulative Payment Comparison
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="year"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{ value: 'Year', position: 'insideBottom', offset: -2, fill: '#64748b' }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            formatter={(value, name) => [formatCurrency(value), name]}
            labelFormatter={(label) => `Year ${label}`}
          />
          <Legend
            wrapperStyle={{ color: '#94a3b8', fontSize: '12px', paddingTop: '16px' }}
          />
          <Line
            type="monotone"
            dataKey="yourOffer"
            name="Your Offer"
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="marketBest"
            name="Market Best"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="mortyRec"
            name="Morty Recommendation"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * RecommendationsList — numbered list of AI recommendations.
 */
const RecommendationsList = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div
      className="rounded-card bg-navy-surface border border-border p-6 mb-6"
      role="region"
      aria-label="AI Recommendations"
    >
      <h2 className="text-sm font-label uppercase tracking-widest text-text-secondary mb-4">
        Recommendations
      </h2>
      <ol className="space-y-3" aria-label="Mortgage recommendations">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center mt-0.5"
              aria-hidden="true"
            >
              {idx + 1}
            </span>
            <p className="text-text-primary text-sm leading-relaxed">{rec}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

/**
 * ProcessingState — shown while analysis is pending or processing.
 */
const ProcessingState = ({ status, onReanalyze, reanalyzing }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="mb-6">
      {status === 'error' ? (
        <span className="text-5xl" aria-hidden="true">⚠️</span>
      ) : (
        <Spinner size="lg" />
      )}
    </div>
    <h2 className="text-xl font-semibold text-text-primary mb-2">
      {status === 'error'
        ? 'Analysis Failed'
        : status === 'processing'
        ? 'Analysing your offer…'
        : 'Waiting for analysis…'}
    </h2>
    <p className="text-text-secondary text-sm mb-6 max-w-sm">
      {status === 'error'
        ? 'Something went wrong while analysing this offer. You can try again.'
        : 'Our AI is reviewing your mortgage offer. This usually takes under a minute.'}
    </p>
    {status === 'error' && (
      <Button
        variant="primary"
        onClick={onReanalyze}
        disabled={reanalyzing}
        aria-label="Retry analysis"
      >
        {reanalyzing ? 'Retrying…' : 'Retry Analysis'}
      </Button>
    )}
  </div>
);

/**
 * SkeletonResults — loading skeleton while fetching analysis data.
 */
const SkeletonResults = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading analysis results">
    <Skeleton className="h-28 rounded-card" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-28 rounded-card" />
    </div>
    <Skeleton className="h-48 rounded-card" />
    <Skeleton className="h-72 rounded-card" />
    <Skeleton className="h-40 rounded-card" />
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

/**
 * AnalysisPage
 * Route: /analysis/:id
 *
 * Fetches and displays the full AI analysis for a single mortgage offer.
 * Subscribes to SSE stream for real-time status updates while pending/processing.
 */
const AnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  // ── Fetch analysis data ──────────────────────────────────────────────────
  const fetchAnalysis = useCallback(async () => {
    try {
      setError(null);
      const response = await api.get(`/analysis/${id}`);
      setAnalysisData(response.data.data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'Failed to load analysis results.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // ── SSE stream for real-time updates ────────────────────────────────────
  const handleStreamUpdate = useCallback(
    (event) => {
      if (event.status === 'analyzed' || event.status === 'error') {
        fetchAnalysis();
      }
    },
    [fetchAnalysis]
  );

  const shouldStream =
    analysisData?.status === 'pending' || analysisData?.status === 'processing';

  useAnalysisStream(shouldStream ? id : null, handleStreamUpdate);

  // ── Re-analyse handler ───────────────────────────────────────────────────
  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      await api.post(`/analysis/${id}/reanalyze`);
      showToast('Re-analysis started. Please wait…', 'info');
      // Reset to processing state and re-fetch
      setAnalysisData((prev) => prev ? { ...prev, status: 'processing' } : prev);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to start re-analysis.';
      showToast(msg, 'error');
    } finally {
      setReanalyzing(false);
    }
  };

  // ── Download report (placeholder — triggers browser print) ──────────────
  const handleDownloadReport = () => {
    window.print();
  };

  // ── Derived data ─────────────────────────────────────────────────────────
  const { status, extractedData, analysis, createdAt } = analysisData || {};
  const chartData = buildChartData(extractedData, analysis);

  const analyzedAt = createdAt
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
        Math.round((new Date(createdAt) - Date.now()) / 60000),
        'minute'
      )
    : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/analysis"
              className="text-text-secondary hover:text-gold transition-colors text-sm"
              aria-label="Back to all analyses"
            >
              ← All Analyses
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Analysis Results
            {extractedData?.bank && (
              <span className="text-gold"> — {extractedData.bank}</span>
            )}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            {status && <StatusBadge status={status} />}
            {analyzedAt && (
              <span className="text-text-muted text-sm">Analysed {analyzedAt}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        {status === 'analyzed' && (
          <div className="flex gap-3 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={handleDownloadReport}
              aria-label="Download analysis report as PDF"
            >
              📄 Download Report
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/upload')}
              aria-label="Upload another mortgage offer"
            >
              Upload Another
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading && <SkeletonResults />}

      {!loading && error && (
        <div
          className="rounded-card bg-red-500/10 border border-red-500/30 p-6 text-center"
          role="alert"
        >
          <p className="text-red-400 font-medium mb-4">{error}</p>
          <Button variant="ghost" onClick={fetchAnalysis}>
            Try Again
          </Button>
        </div>
      )}

      {!loading && !error && analysisData && (
        <>
          {/* Pending / Processing / Error states */}
          {(status === 'pending' || status === 'processing' || status === 'error') && (
            <ProcessingState
              status={status}
              onReanalyze={handleReanalyze}
              reanalyzing={reanalyzing}
            />
          )}

          {/* Fully analysed results */}
          {status === 'analyzed' && (
            <>
              {/* AI Summary */}
              {analysis?.aiReasoning && (
                <AISummaryCard reasoning={analysis.aiReasoning} />
              )}

              {/* Metrics row */}
              <MetricsRow analysis={analysis} />

              {/* Extracted terms table */}
              <TermsTable extractedData={extractedData} analysis={analysis} />

              {/* Comparison chart */}
              {chartData.length > 0 && <ComparisonChart chartData={chartData} />}

              {/* Recommendations */}
              {analysis?.recommendations?.length > 0 && (
                <RecommendationsList recommendations={analysis.recommendations} />
              )}

              {/* Bottom CTA */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 print:hidden">
                <Button
                  variant="ghost"
                  onClick={handleDownloadReport}
                  className="flex-1"
                  aria-label="Download analysis report"
                >
                  📄 Download Report PDF
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/upload')}
                  className="flex-1"
                  aria-label="Upload another mortgage offer"
                >
                  Upload Another Offer
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AnalysisPage;
