/**
 * Dashboard Page
 * Main authenticated view with stats, charts, and offers overview
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDashboard, getOffers } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, subtitle, icon, loading }) => {
  if (loading) return <SkeletonCard />;

  return (
    <Card interactive className="stat-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#94a3b8] mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold text-[#f8fafc] mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-[#94a3b8]">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

/**
 * Custom Tooltip for Charts
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-surface border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-[#f8fafc] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: ₪{entry.value?.toLocaleString('he-IL')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }) => {
  const styles = {
    analyzed: 'bg-success/10 text-success',
    pending: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  const labels = {
    analyzed: 'Analyzed',
    pending: 'Pending',
    error: 'Error',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {labels[status] || 'Pending'}
    </span>
  );
};

/**
 * Dashboard Page Component
 */
const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, offersRes] = await Promise.all([
        getDashboard(),
        getOffers(),
      ]);
      setDashboardData(dashRes.data);
      setOffers(offersRes.data?.offers || []);
    } catch (error) {
      // Use mock data if API not available
      setDashboardData({
        bestRate: 3.2,
        marketRate: 3.6,
        potentialSavings: 48000,
        activeOffers: offers.length || 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mock chart data
  const chartData = [
    { name: 'Bank A', monthly: 6200, recommended: 5800 },
    { name: 'Bank B', monthly: 6050, recommended: 5800 },
    { name: 'Recommended', monthly: 5800, recommended: 5800 },
  ];

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-[#94a3b8]">
          Here's your mortgage analysis summary
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Best Rate"
          value={loading ? '...' : `${dashboardData?.bestRate || 3.2}%`}
          subtitle={`-${((dashboardData?.marketRate || 3.6) - (dashboardData?.bestRate || 3.2)).toFixed(1)}% vs market`}
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
        <StatCard
          title="Potential Savings"
          value={loading ? '...' : `₪${(dashboardData?.potentialSavings || 48000).toLocaleString('he-IL')}`}
          subtitle="Lifetime savings"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Active Offers"
          value={loading ? '...' : (offers.length || 0).toString()}
          subtitle="Uploaded offers"
          loading={loading}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
          Monthly Payment Comparison
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
              />
              <Bar dataKey="monthly" name="Monthly Payment" fill="#334155" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommended" name="Recommended" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Offers Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#f8fafc]">Your Offers</h2>
          <Link to="/upload">
            <Button variant="primary" className="text-sm py-2 px-4">
              + Upload New Offer
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 shimmer rounded" />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-[#334155] mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-[#94a3b8] mb-4">No offers uploaded yet</p>
            <Link to="/upload">
              <Button variant="ghost">Upload Your First Offer</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Mortgage offers">
              <thead>
                <tr className="border-b border-border">
                  {['Bank', 'Rate', 'Term', 'Monthly Payment', 'Status', 'Actions'].map(
                    (header) => (
                      <th
                        key={header}
                        className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-[#94a3b8]"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {offers.map((offer) => (
                  <tr
                    key={offer._id}
                    className="hover:bg-navy-elevated transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-[#f8fafc]">
                      {offer.extractedData?.bank || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#f8fafc]">
                      {offer.extractedData?.rate
                        ? `${offer.extractedData.rate}%`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94a3b8]">
                      {offer.extractedData?.term
                        ? `${offer.extractedData.term} yr`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#f8fafc]">
                      {offer.extractedData?.monthlyPayment
                        ? `₪${offer.extractedData.monthlyPayment.toLocaleString('he-IL')}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={offer.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/analysis/${offer._id}`}
                        className="text-sm text-gold hover:text-gold-light transition-colors"
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
      </Card>
    </PageLayout>
  );
};

export default DashboardPage;
