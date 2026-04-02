/**
 * AnalysisPage - Display AI analysis results for a mortgage offer.
 * GET /api/v1/analysis/:id
 * POST /api/v1/analysis/:id/reanalyze
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';
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

export default function AnalysisPage() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reanalyzing, setReanalyzing] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/analysis/${id}`);
      setData(res.data.data);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to load analysis results.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Poll if status is pending/processing
  useEffect(() => {
    if (!data) return;
    if (data.status === 'pending' || data.status === 'processing') {
      const timer = setTimeout(fetchAnalysis, 5000);
      return () => clearTimeout(timer);
    }
  }, [data, fetchAnalysis]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      await api.post(`/analysis/${id}/reanalyze`);
      addToast('Re-analysis started. Results will update shortly.', 'info');
      setTimeout(fetchAnalysis, 3000);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to start re-analysis.';
      addToast(message, 'error');
    } finally {
      setReanalyzing(false);
    }
  };

  const formatCurrency = (val) =>
    val != null
      ? new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(val)
      : '—';

  const formatPercent = (val) =>
    val != null ? `${Number(val).toFixed(2)}%` : '—';

  // Build comparison chart data (monthly payments over time)
  const buildChartData = (analysis) => {
    if (!analysis) return [];
    const months = 60; // Show 5 years of data points
    return Array.from({ length: months }, (_, i) => ({
      month: i + 1,
      'Your Offer': analysis.monthlyPayment || 0,
      'Market Best': analysis.marketAverageRate
        ? Math.round((analysis.monthlyPayment || 0) * (1 - (analysis.rateVsMarket || 0) / 100))
        : 0,
      'Morty Recommended': analysis.recommendedRate
        ? Math.round((analysis.monthlyPayment || 0) * 0.95)
        : 0,
    }));
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-3xl">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40 mb-8" />
          <Skeleton className="h-32 w-full mb-6" />
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="max-w-3xl text-center py-16">
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#f8fafc' }}>Analysis Not Found</h2>
          <p className="mb-6" style={{ color: '#94a3b8' }}>{error}</p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg"
            style={{ background: '#f59e0b', color: '#0f172a', borderRadius: '8px' }}
          >
            Upload New Offer
          </Link>
        </div>
      </PageLayout>
    );
  }

  const analysis = data?.analysis;
  const extracted = data?.extractedData;
  const isPending = data?.status === 'pending' || data?.status === 'processing';

  return (
    <PageLayout>
      <div className="page-enter max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#f8fafc' }}>
            Analysis Results
            {extracted?.bank ? ` — ${extracted.bank}` : ''}
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
            {data?.createdAt
              ? `Analyzed ${new Date(data.createdAt).toLocaleString()}`
              : 'Analysis pending'}
          </p>
        </div>

        {/* Pending State */}
        {isPending && (
          <div
            className="rounded-card p-6 mb-6 flex items-center gap-4"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <Spinner size={32} />
            <div>
              <p className="font-medium" style={{ color: '#f8fafc' }}>Analysis in progress...</p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>This usually takes 30–60 seconds. Page will auto-refresh.</p>
            </div>
          </div>
        )}

        {/* AI Summary Card */}
        {analysis?.aiReasoning && (
          <div
            className="rounded-card p-6 mb-6 analysis-card"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5" style={{ color: '#f59e0b' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <h2 className="font-semibold" style={{ color: '#f59e0b' }}>AI Summary</h2>
            </div>
            <p style={{ color: '#f8fafc', lineHeight: 1.7 }}>{analysis.aiReasoning}</p>
          </div>
        )}

        {/* Extracted Terms */}
        {extracted && (
          <div
            className="rounded-card p-6 mb-6"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Extracted Terms</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <TermItem label="Bank" value={extracted.bank || '—'} />
              <TermItem label="Loan Amount" value={formatCurrency(extracted.amount)} />
              <TermItem label="Interest Rate" value={formatPercent(extracted.rate)} />
              <TermItem label="Term" value={extracted.term ? `${extracted.term} years` : '—'} />
              <TermItem label="Monthly Payment" value={formatCurrency(analysis?.monthlyPayment)} />
              <TermItem label="Total Cost" value={formatCurrency(analysis?.totalCost)} />
            </div>
          </div>
        )}

        {/* Analysis Metrics */}
        {analysis && (
          <div
            className="rounded-card p-6 mb-6"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Analysis Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <TermItem label="Recommended Rate" value={formatPercent(analysis.recommendedRate)} accent />
              <TermItem label="Potential Savings" value={formatCurrency(analysis.savings)} accent />
              <TermItem label="Market Average" value={formatPercent(analysis.marketAverageRate)} />
              <TermItem label="Rate vs Market" value={analysis.rateVsMarket != null ? `${analysis.rateVsMarket > 0 ? '+' : ''}${analysis.rateVsMarket.toFixed(2)}%` : '—'} />
              <TermItem label="Affordability" value={analysis.affordabilityScore ? `${analysis.affordabilityScore}/100` : '—'} />
              <TermItem label="Debt-to-Income" value={analysis.debtToIncomeRatio ? `${(analysis.debtToIncomeRatio * 100).toFixed(1)}%` : '—'} />
            </div>
          </div>
        )}

        {/* Comparison Chart */}
        {analysis && (
          <div
            className="rounded-card p-6 mb-6"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Payment Comparison</h2>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={buildChartData(analysis)} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', fill: '#64748b', offset: -5 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#273549', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#94a3b8' }}
                  formatter={(value) => [formatCurrency(value)]}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', paddingTop: '16px' }} />
                <Line type="monotone" dataKey="Your Offer" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Market Best" stroke="#94a3b8" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Morty Recommended" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recommendations */}
        {analysis?.recommendations?.length > 0 && (
          <div
            className="rounded-card p-6 mb-6"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>Recommendations</h2>
            <ol className="space-y-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}
                  >
                    {idx + 1}
                  </span>
                  <p className="text-sm" style={{ color: '#f8fafc' }}>{rec}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReanalyze}
            disabled={reanalyzing || isPending}
            className="flex items-center gap-2 px-6 py-3 font-semibold transition-all"
            style={{
              background: '#f59e0b',
              color: '#0f172a',
              borderRadius: '8px',
              border: 'none',
              cursor: reanalyzing || isPending ? 'not-allowed' : 'pointer',
              opacity: reanalyzing || isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!reanalyzing && !isPending) e.currentTarget.style.background = '#fbbf24'; }}
            onMouseLeave={(e) => { if (!reanalyzing && !isPending) e.currentTarget.style.background = '#f59e0b'; }}
          >
            {reanalyzing ? <><Spinner size={18} /><span>Re-analyzing...</span></> : 'Re-analyze'}
          </button>
          <Link
            to="/upload"
            className="flex items-center gap-2 px-6 py-3 font-medium transition-all"
            style={{
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#94a3b8',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.color = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            Upload Another
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

function TermItem({ label, value, accent }) {
  return (
    <div
      className="p-3 rounded-lg"
      style={{ background: '#273549' }}
    >
      <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>{label}</p>
      <p className="font-semibold" style={{ color: accent ? '#10b981' : '#f8fafc' }}>{value}</p>
    </div>
  );
}
