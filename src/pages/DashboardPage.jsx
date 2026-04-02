import React, { useEffect, useState, useCallback } from 'react';
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
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import api from '../services/api';

/**
 * Stat card component for dashboard summary metrics.
 */
const StatCard = ({ title, value, subtitle, loading }) => (
  <Card interactive className="flex flex-col gap-2">
    {loading ? (
      <>
        <Skeleton height="14px" width="60%" />
        <Skeleton height="32px" width="40%" className="mt-1" />
        <Skeleton height="12px" width="70%" />
      </>
    ) : (
      <>
        <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
      </>
    )}
  </Card>
);

/**
 * Custom tooltip for the bar chart.
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-surface border border-border rounded-input p-3 shadow-card">
        <p className="text-xs text-text-secondary mb-1">{label}</p>
        {payload.map((entry) => (
          <p key={entry.name} className="text-sm font-semibold" style={{ color: entry.color }}>
            {entry.name}: ₪{entry.value?.toLocaleString('he-IL')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Status badge for offer status.
 */
const StatusBadge = ({ status }) => {
  const styles = {
    analyzed: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    processing: 'bg-blue-400/10 text-blue-400',
    error: 'bg-error/10 text-error',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

/**
 * DashboardPage — main authenticated landing page.
 * Shows summary stats, payment comparison chart, and offers table.
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  // Fetch dashboard summary stats
  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, offersStatsRes] = await Promise.all([
        api.get('/profile/financials').catch(() => ({ data: { data: null } })),
        api.get('/offers/stats').catch(() => ({ data: { data: { stats: {} } } })),
      ]);

      const financials = statsRes.data?.data;
      const offerStats = offersStatsRes.data?.data?.stats || {};

      setStats({
        financials,
        offerStats,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch recent offers
  const fetchOffers = useCallback(async () => {
    try {
      const res = await api.get('/offers', { params: { limit: 5, page: 1 } });
      setOffers(res.data?.data?.offers || []);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setOffersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchOffers();
  }, [fetchStats, fetchOffers]);

  // Build chart data from offers
  const chartData = offers
    .filter((o) => o.extractedData?.amount && o.extractedData?.rate)
    .slice(0, 4)
    .map((o) => ({
      name: o.extractedData?.bank || 'Bank',
      'Monthly Payment': Math.round(
        (o.extractedData.amount *
          (o.extractedData.rate / 100 / 12) *
          Math.pow(1 + o.extractedData.rate / 100 / 12, (o.extractedData.term || 25) * 12)) /
          (Math.pow(1 + o.extractedData.rate / 100 / 12, (o.extractedData.term || 25) * 12) - 1)
      ),
    }));

  // Fallback chart data for demo
  const displayChartData =
    chartData.length > 0
      ? chartData
      : [
          { name: 'Bank A', 'Monthly Payment': 4200 },
          { name: 'Bank B', 'Monthly Payment': 4050 },
          { name: 'Recommended', 'Monthly Payment': 3800 },
        ];

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-text-secondary mt-1">
            Here's your mortgage analysis summary
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Best Rate"
            value={
              offers.find((o) => o.status === 'analyzed')?.analysis?.recommendedRate
                ? `${offers.find((o) => o.status === 'analyzed').analysis.recommendedRate}%`
                : '—'
            }
            subtitle="Based on analyzed offers"
            loading={loading}
          />
          <StatCard
            title="Potential Savings"
            value={
              offers.find((o) => o.status === 'analyzed')?.analysis?.savings
                ? `₪${offers.find((o) => o.status === 'analyzed').analysis.savings.toLocaleString('he-IL')}`
                : '—'
            }
            subtitle="Lifetime savings estimate"
            loading={loading}
          />
          <StatCard
            title="Active Offers"
            value={stats?.offerStats?.total ?? '—'}
            subtitle={`${stats?.offerStats?.analyzed ?? 0} analyzed`}
            loading={loading}
          />
        </div>

        {/* Chart */}
        <Card>
          <h2 className="text-base font-semibold text-text-primary mb-6">
            Monthly Payment Comparison
          </h2>
          {loading ? (
            <Skeleton height="200px" className="w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={displayChartData} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Bar
                  dataKey="Monthly Payment"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Offers table */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-text-primary">Mortgage Offers</h2>
            <a
              href="/offers"
              className="text-sm text-gold hover:text-gold-light transition-colors font-medium"
            >
              + Upload New Offer
            </a>
          </div>

          {offersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="44px" className="w-full" />
              ))}
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-text-muted mx-auto mb-3"
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-secondary text-sm">No offers uploaded yet.</p>
              <a
                href="/offers"
                className="mt-3 inline-block text-sm text-gold hover:text-gold-light transition-colors"
              >
                Upload your first offer →
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Mortgage offers">
                <thead>
                  <tr className="border-b border-border">
                    {['Bank', 'Rate', 'Term', 'Monthly Payment', 'Status'].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-2 text-xs font-medium text-text-secondary uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {offers.map((offer) => (
                    <tr
                      key={offer._id}
                      className="hover:bg-navy-elevated transition-colors"
                    >
                      <td className="py-3 px-2 text-text-primary font-medium">
                        {offer.extractedData?.bank || offer.originalFile?.originalName || 'Unknown'}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {offer.extractedData?.rate ? `${offer.extractedData.rate}%` : '—'}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {offer.extractedData?.term ? `${offer.extractedData.term}yr` : '—'}
                      </td>
                      <td className="py-3 px-2 text-text-secondary">
                        {offer.extractedData?.monthlyPayment
                          ? `₪${offer.extractedData.monthlyPayment.toLocaleString('he-IL')}`
                          : '—'}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={offer.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;
