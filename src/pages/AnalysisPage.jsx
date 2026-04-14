/**
 * AnalysisPage.jsx
 * Analysis results page for a specific mortgage offer.
 * Route: /analysis/:id
 *
 * Handles three states:
 * - pending: shows spinner + "Waiting for analysis" with auto-polling
 * - analyzed: shows full results (extracted terms, AI summary, chart, recommendations)
 * - error: shows error state with retry button
 *
 * Uses offer.id (Firestore string ID) from route params.
 * Null-guards all analysis fields (offer may still be pending).
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';
import Spinner from '../components/common/Spinner.jsx';

/**
 * Generates monthly payment data for a line chart.
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (%)
 * @param {number} termYears - Loan term in years
 * @returns {Array<{month: number, payment: number}>}
 */
function generatePaymentData(principal, annualRate, termYears) {
  const months = termYears * 12;
  const r = annualRate / 100 / 12;
  if (r === 0 || months === 0) return [];
  const payment = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  // Sample every 12 months for readability
  return Array.from({ length: Math.ceil(months / 12) }, (_, i) => ({
    month: (i + 1) * 12,
    payment: Math.round(payment)
  }));
}

/**
 * Analysis results page for a specific mortgage offer.
 */
export default function AnalysisPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const fetchOffer = useCallback(async () => {
    try {
      const { data: envelope } = await api.get(`/analysis/${id}`);
      // Backend returns { data: OfferShape }
      const data = envelope?.data || envelope;
      setOffer(data);
      return data;
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        t('analysis.notFound');
      setError(msg);
      return null;
    }
  }, [id, t]);

  useEffect(() => {
    let interval;

    async function init() {
      setLoading(true);
      const data = await fetchOffer();
      setLoading(false);

      if (data && data.status === 'pending') {
        setPolling(true);
        interval = setInterval(async () => {
          try {
            const { data: envelope } = await api.get(`/analysis/${id}`);
            const updated = envelope?.data || envelope;
            setOffer(updated);
            if (updated.status !== 'pending') {
              clearInterval(interval);
              setPolling(false);
            }
          } catch {
            clearInterval(interval);
            setPolling(false);
          }
        }, 5000);
      }
    }

    init();
    return () => clearInterval(interval);
  }, [id, fetchOffer]);

  /**
   * Retry analysis for an offer in error state.
   */
  const handleRetry = async () => {
    setRetrying(true);
    try {
      await api.post(`/analysis/${id}/reanalyze`);
      // Refresh the offer data
      const data = await fetchOffer();
      if (data) setOffer(data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        t('analysis.retryFailed')
      );
    } finally {
      setRetrying(false);
    }
  };

  const extracted = offer?.extractedData || {};
  const result = offer?.analysis || {};

  const chartData =
    extracted.amount && extracted.rate && extracted.term
      ? generatePaymentData(extracted.amount, extracted.rate, extracted.term).map((d) => ({
          ...d,
          yourOffer: d.payment,
          recommended: result.recommendedRate
            ? Math.round(
                (extracted.amount *
                  (result.recommendedRate / 100 / 12) *
                  Math.pow(1 + result.recommendedRate / 100 / 12, extracted.term * 12)) /
                  (Math.pow(1 + result.recommendedRate / 100 / 12, extracted.term * 12) - 1)
              )
            : undefined
        }))
      : [];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f8fafc]">
            {t('analysis.title')}{extracted.bank ? ` — ${extracted.bank}` : ''}
          </h1>
          {offer?.updatedAt && (
            <p className="text-[#94a3b8] mt-1 text-sm">
              {t('analysis.analyzed', { date: formatDate(offer.updatedAt) })}
            </p>
          )}
          {polling && (
            <p className="text-yellow-400 text-sm mt-1 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
              {t('analysis.polling')}
            </p>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div
            className="flex flex-col gap-4"
            aria-label={t('analysis.loading')}
            aria-busy="true"
          >
            <Skeleton height="120px" className="rounded-card" />
            <Skeleton height="200px" className="rounded-card" />
          </div>
        ) : error ? (
          /* API error state */
          <Card>
            <div className="text-center py-6">
              <p className="text-red-400 mb-4">{error}</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setError(null);
                  setLoading(true);
                  fetchOffer().then(() => setLoading(false));
                }}
              >
                {t('analysis.tryAgain')}
              </Button>
            </div>
          </Card>
        ) : offer?.status === 'pending' ? (
          /* Pending state */
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Spinner size="lg" className="mb-4" />
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-2">
                {t('analysis.waiting.title')}
              </h2>
              <p className="text-[#94a3b8] text-sm">
                {t('analysis.waiting.subtitle')}
              </p>
            </div>
          </Card>
        ) : offer?.status === 'error' ? (
          /* Analysis error state */
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-5xl mb-4" aria-hidden="true">❌</span>
              <h2 className="text-lg font-semibold text-red-400 mb-2">{t('analysis.failed.title')}</h2>
              <p className="text-[#94a3b8] text-sm mb-6">
                {t('analysis.failed.subtitle')}
              </p>
              <Button
                variant="primary"
                onClick={handleRetry}
                loading={retrying}
                aria-label={t('analysis.retry')}
              >
                {t('analysis.retry')}
              </Button>
            </div>
          </Card>
        ) : (
          /* Analyzed state — full results */
          <>
            {/* AI Summary */}
            {result.aiReasoning && (
              <Card goldTop className="mb-6">
                <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3">{t('analysis.aiSummary')}</p>
                <p className="text-[#f8fafc] leading-relaxed">{result.aiReasoning}</p>
              </Card>
            )}

            {/* Extracted terms */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">{t('analysis.terms')}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: t('analysis.bank'),          value: extracted.bank },
                  { label: t('analysis.amount'),        value: extracted.amount ? formatCurrency(extracted.amount) : undefined },
                  { label: t('analysis.rate'), value: extracted.rate ? `${Number(extracted.rate).toFixed(2)}%` : undefined },
                  { label: t('analysis.term'),          value: extracted.term ? `${extracted.term} years` : undefined },
                  { label: t('analysis.monthly'),   value: extracted.monthlyPayment ? formatCurrency(extracted.monthlyPayment) : undefined },
                  { label: t('analysis.recommended'),   value: result.recommendedRate ? `${result.recommendedRate}%` : undefined }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#64748b] mb-1">{label}</p>
                    <p className="text-[#f8fafc] font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Savings highlight */}
            {(result.savings ?? 0) > 0 && (
              <Card className="mb-6 border-green-800">
                <p className="text-xs font-medium uppercase tracking-widest text-green-400 mb-1">{t('analysis.savings')}</p>
                <p className="text-3xl font-bold text-green-400">{formatCurrency(result.savings)}</p>
                <p className="text-[#94a3b8] text-sm mt-1">{t('analysis.savingsSubtitle')}</p>
              </Card>
            )}

            {/* Comparison chart */}
            {chartData.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">{t('analysis.chart.title')}</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      label={{ value: t('analysis.chart.month'), position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `₪${v.toLocaleString()}`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f8fafc' }}
                      formatter={(v) => [`₪${v.toLocaleString()}`, '']}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="yourOffer"
                      name={t('analysis.chart.yourOffer')}
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    {result.recommendedRate && (
                      <Line
                        type="monotone"
                        dataKey="recommended"
                        name={t('analysis.chart.recommended')}
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">{t('analysis.recommendations')}</h2>
                <ol className="flex flex-col gap-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-[#94a3b8] text-sm">{rec}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={() => window.print()}
                aria-label={t('analysis.download')}
              >
                {t('analysis.download')}
              </Button>
              <Link to="/upload">
                <Button aria-label={t('analysis.uploadAnother')}>{t('analysis.uploadAnother')}</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
