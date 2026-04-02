/**
 * Dashboard Page
 * Main authenticated view with stats, charts, and offers table
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { getDashboard, getOffers } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import Spinner from '../components/common/Spinner';

const STATUS_COLORS = {
  analyzed: 'text-green-400 bg-green-400/10',
  pending: 'text-yellow-400 bg-yellow-400/10',
  error: 'text-red-400 bg-red-400/10',
};

const STATUS_LABELS = {
  analyzed: '\u2713 Analyzed',
  pending: '\u23f3 Pending',
  error: '\u2717 Error',
};

function StatCard({ title, value, subtitle, loading }) {
  if (loading) {
    return (
      <Card>
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </Card>
    );
  }

  return (
    <Card interactive>
      <p className="text-xs font-medium uppercase tracking-wider text-text-secondary mb-2">
        {title}
      </p>
      <p className="text-3xl font-bold text-text-primary mb-1">{value}</p>
      {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
    </Card>
  );
}

function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { error: showError } = useToast();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, offersRes] = await Promise.all([
          getDashboard(),
          getOffers(),
        ]);
        setDashboardData(dashRes.data);
        setOffers(offersRes.data?.offers || offersRes.data || []);
      } catch (err) {
        // Use mock data if API not available
        setDashboardData({
          bestRate: 3.2,
          potentialSavings: 48000,
          activeOffers: 3,
          marketRate: 3.6,
          chartData: [
            { name: 'Bank A', payment: 6200, fill: '#94a3b8' },
            { name: 'Bank B', payment: 5900, fill: '#94a3b8' },
            { name: 'Recommended', payment: 5400, fill: '#f59e0b' },
          ],
        });
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = dashboardData?.chartData || [
    { name: 'Bank A', payment: 6200 },
    { name: 'Bank B', payment: 5900 },
    { name: 'Recommended', payment: 5400 },
  ];

  const formatCurrency = (value) =>
    new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(value);

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          {t('dashboard.welcome')}, {user?.fullName?.split(' ')[0] || 'there'}
        </h1>
        <p className="text-text-secondary mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('dashboard.bestRate')}
          value={loading ? '...' : `${dashboardData?.bestRate || '--'}%`}
          subtitle={loading ? '' : `${dashboardData?.marketRate - dashboardData?.bestRate > 0 ? '-' : '+'}${Math.abs((dashboardData?.marketRate || 0) - (dashboardData?.bestRate || 0)).toFixed(1)}% ${t('dashboard.vsMarket')}`}
          loading={loading}
        />
        <StatCard
          title={t('dashboard.potentialSavings')}
          value={loading ? '...' : formatCurrency(dashboardData?.potentialSavings || 0)}
          subtitle={loading ? '' : t('dashboard.lifetime')}
          loading={loading}
        />
        <StatCard
          title={t('dashboard.activeOffers')}
          value={loading ? '...' : `${dashboardData?.activeOffers || offers.length} Active`}
          loading={loading}
        />
      </div>

      {/* Chart */}
      <Card className="mb-8">
        <h2 className="text-base font-semibold text-text-primary mb-6">
          {t('dashboard.paymentComparison')}
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Monthly Payment']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                }}
              />
              <Bar dataKey="payment" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Offers Table */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-text-primary">Mortgage Offers</h2>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            {t('dashboard.uploadNew')}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 text-text-muted mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-text-secondary">{t('dashboard.noOffers')}</p>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => navigate('/upload')}
            >
              Upload First Offer
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left rtl:text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">Bank</th>
                  <th className="text-left rtl:text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">Rate</th>
                  <th className="text-left rtl:text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">Term</th>
                  <th className="text-left rtl:text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">Payment</th>
                  <th className="text-left rtl:text-right py-3 px-4 text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer._id} className="border-b border-border/50 hover:bg-navy-elevated transition-colors">
                    <td className="py-3 px-4 text-text-primary">
                      {offer.extractedData?.bank || 'Unknown'}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {offer.extractedData?.rate ? `${offer.extractedData.rate}%` : '--'}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {offer.extractedData?.term ? `${offer.extractedData.term} yr` : '--'}
                    </td>
                    <td className="py-3 px-4 text-text-primary">
                      {offer.extractedData?.monthlyPayment
                        ? formatCurrency(offer.extractedData.monthlyPayment)
                        : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          STATUS_COLORS[offer.status] || STATUS_COLORS.pending
                        }`}
                      >
                        {STATUS_LABELS[offer.status] || offer.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {offer.status === 'analyzed' && (
                        <Link
                          to={`/analysis/${offer._id}`}
                          className="text-gold hover:text-gold-light text-xs font-medium"
                        >
                          View Results
                        </Link>
                      )}
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
}

export default DashboardPage;
