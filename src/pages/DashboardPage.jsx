/**
 * DashboardPage - Main authenticated view showing mortgage analysis summary.
 * Fetches data from GET /api/v1/dashboard.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/dashboard');
      setDashboardData(res.data.data);
    } catch (err) {
      const message = err?.response?.data?.error || 'Failed to load dashboard data.';
      setError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const summary = dashboardData?.summary;
  const comparisonData = dashboardData?.comparisonData || [];
  const recentOffers = dashboardData?.recentOffers || [];

  const formatCurrency = (val) =>
    val != null
      ? new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(val)
      : '—';

  const formatPercent = (val) =>
    val != null ? `${Number(val).toFixed(2)}%` : '—';

  return (
    <PageLayout>
      <div className="page-enter">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#f8fafc' }}>
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1" style={{ color: '#94a3b8' }}>
            Here&apos;s your mortgage analysis summary
          </p>
        </div>

        {error && (
          <div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
            <button
              onClick={fetchDashboard}
              className="ml-auto text-sm font-medium"
              style={{ color: '#f59e0b' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="stat-card">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                title="Best Rate"
                value={formatPercent(summary?.bestRate)}
                subtitle={summary?.bestRateBank || 'No offers yet'}
                accent={summary?.rateVsMarket < 0}
              />
              <StatCard
                title="Potential Savings"
                value={formatCurrency(summary?.totalPotentialSavings)}
                subtitle="Lifetime savings"
              />
              <StatCard
                title="Active Offers"
                value={summary?.totalOffers ?? 0}
                subtitle={`${summary?.analyzedOffers ?? 0} analyzed`}
              />
            </>
          )}
        </div>

        {/* Chart */}
        {!loading && comparisonData.length > 0 && (
          <div
            className="rounded-card p-6 mb-8"
            style={{ background: '#1e293b', border: '1px solid #334155' }}
          >
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>
              Monthly Payment Comparison
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bank" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#273549', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#94a3b8' }}
                  formatter={(value) => [formatCurrency(value), 'Monthly Payment']}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                <Bar dataKey="monthlyPayment" name="Monthly Payment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Offers Table */}
        <div
          className="rounded-card p-6"
          style={{ background: '#1e293b', border: '1px solid #334155' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: '#f8fafc' }}>
              Mortgage Offers
            </h2>
            <Link
              to="/upload"
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{ background: '#f59e0b', color: '#0f172a', borderRadius: '8px' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#fbbf24')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f59e0b')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New Offer
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : recentOffers.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: '#334155' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p style={{ color: '#64748b' }}>No offers uploaded yet.</p>
              <Link
                to="/upload"
                className="inline-block mt-3 text-sm font-medium"
                style={{ color: '#f59e0b' }}
              >
                Upload your first offer
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155' }}>
                    {['Bank', 'Rate', 'Term', 'Monthly Payment', 'Status', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider"
                        style={{ color: '#64748b' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOffers.map((offer) => (
                    <tr
                      key={offer._id}
                      style={{ borderBottom: '1px solid #273549' }}
                      className="transition-colors"
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#273549')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td className="py-3 px-4" style={{ color: '#f8fafc' }}>
                        {offer.extractedData?.bank || offer.originalFile?.originalName || 'Unknown'}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#94a3b8' }}>
                        {formatPercent(offer.extractedData?.rate)}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#94a3b8' }}>
                        {offer.extractedData?.term ? `${offer.extractedData.term} yr` : '—'}
                      </td>
                      <td className="py-3 px-4" style={{ color: '#94a3b8' }}>
                        {formatCurrency(offer.analysis?.monthlyPayment)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={offer.status} />
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          to={`/analysis/${offer._id}`}
                          className="text-xs font-medium transition-colors"
                          style={{ color: '#f59e0b' }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#f59e0b')}
                        >
                          View Results
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

function StatCard({ title, value, subtitle, accent }) {
  return (
    <div className="stat-card">
      <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>
        {title}
      </p>
      <p
        className="text-3xl font-bold mb-1"
        style={{ color: accent ? '#10b981' : '#f8fafc' }}
      >
        {value}
      </p>
      <p className="text-sm" style={{ color: '#94a3b8' }}>
        {subtitle}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Pending' },
    processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'Processing' },
    analyzed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Analyzed' },
    error: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Error' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
