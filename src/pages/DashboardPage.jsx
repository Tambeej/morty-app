import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

/**
 * Main dashboard page showing mortgage analysis summary.
 * Uses Firestore data shapes: offer.id (string), ISO timestamps.
 * Dashboard response: { data: { financials, recentOffers, stats: { totalOffers, savingsTotal } } }
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashboard, setDashboard] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: envelope } = await api.get('/dashboard');
        // Backend returns { data: { financials, recentOffers, stats } }
        const dashData = envelope?.data || envelope;
        setDashboard(dashData);
        // Use recentOffers from dashboard response
        setOffers(dashData?.recentOffers || []);
      } catch (err) {
        setError(err?.response?.data?.message || t('dashboard.error'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /**
   * Get the offer ID — supports both Firestore string id and legacy _id.
   */
  function getOfferId(offer) {
    return offer.id || offer._id;
  }

  /**
   * Get display name from user object.
   * Firestore user shape: { id, email, phone, verified }
   * Falls back to email prefix or 'there'.
   */
  function getUserDisplayName() {
    if (!user) return 'there';
    // Try name fields first, then email prefix
    const name = user.name || user.fullName || user.displayName;
    if (name) return name.split(' ')[0];
    if (user.email) return user.email.split('@')[0];
    return 'there';
  }

  const stats = dashboard?.stats || {};
  const totalOffers = stats.totalOffers ?? offers.length;
  const savingsTotal = stats.savingsTotal ?? 0;

  const chartData = offers.slice(0, 3).map((o, i) => ({
    name: o.extractedData?.bank || `Offer ${i + 1}`,
    monthly: o.extractedData?.monthlyPayment || 0,
    recommended: o.analysis?.recommendedRate
      ? Math.round(
          (o.extractedData?.amount || 0) /
          ((o.extractedData?.term || 1) * 12)
        )
      : 0
  }));

  return (
    <PageLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          {t('dashboard.welcome', { name: getUserDisplayName() })}
        </h1>
        <p className="text-[#94a3b8] mt-1">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height="120px" className="rounded-card" />
          ))}
        </div>
      ) : error ? (
        <p className="text-red-400 mb-8">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card interactive>
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">{t('dashboard.bestRate')}</p>
            <p className="text-3xl font-bold text-gold">{dashboard?.bestRate ?? t('dashboard.bestRateEmpty')}</p>
            <p className="text-sm text-[#64748b] mt-1">
              {dashboard?.rateVsMarket
                ? t('dashboard.bestRateVsMarket', { rate: dashboard.rateVsMarket })
                : t('dashboard.noData')}
            </p>
          </Card>

          <Card interactive>
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">{t('dashboard.savings')}</p>
            <p className="text-3xl font-bold text-gold">
              {savingsTotal ? formatCurrency(savingsTotal) : '—'}
            </p>
            <p className="text-sm text-[#64748b] mt-1">{t('dashboard.savingsSubtitle')}</p>
          </Card>

          <Card interactive>
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">{t('dashboard.offers')}</p>
            <p className="text-3xl font-bold text-gold">{totalOffers}</p>
            <p className="text-sm text-[#64748b] mt-1">{t('dashboard.offersSubtitle')}</p>
          </Card>
        </div>
      )}

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">{t('dashboard.chart.title')}</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(v) => `₪${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(v) => [`₪${v.toLocaleString()}`, '']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
              <Bar dataKey="monthly" name={t('dashboard.chart.yourOffer')} fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommended" name={t('dashboard.chart.recommended')} fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Offers table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f8fafc]">{t('dashboard.table.title')}</h2>
          <Link to="/upload">
            <Button variant="ghost" className="text-sm py-2 px-4">{t('dashboard.table.upload')}</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => <Skeleton key={i} height="44px" />)}
          </div>
        ) : offers.length === 0 ? (
          <p className="text-[#64748b] text-sm py-4 text-center">
            {t('dashboard.table.empty')}{' '}
            <Link to="/upload" className="text-gold hover:underline">{t('dashboard.table.emptyLink')}</Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[#64748b] text-left">
                  <th className="pb-3 font-medium">{t('dashboard.table.bank')}</th>
                  <th className="pb-3 font-medium">{t('dashboard.table.rate')}</th>
                  <th className="pb-3 font-medium">{t('dashboard.table.term')}</th>
                  <th className="pb-3 font-medium">{t('dashboard.table.date')}</th>
                  <th className="pb-3 font-medium">{t('dashboard.table.status')}</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => {
                  const offerId = getOfferId(offer);
                  return (
                    <tr key={offerId} className="border-b border-border/50 hover:bg-navy-elevated transition-colors">
                      <td className="py-3 text-[#f8fafc]">{offer.extractedData?.bank || '—'}</td>
                      <td className="py-3 text-[#94a3b8]">
                        {offer.extractedData?.rate ? `${offer.extractedData.rate}%` : '—'}
                      </td>
                      <td className="py-3 text-[#94a3b8]">
                        {offer.extractedData?.term ? `${offer.extractedData.term}yr` : '—'}
                      </td>
                      <td className="py-3 text-[#94a3b8]">
                        {formatDate(offer.createdAt)}
                      </td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          offer.status === 'analyzed' ? 'bg-green-900/40 text-green-400' :
                          offer.status === 'error'    ? 'bg-red-900/40 text-red-400' :
                          'bg-yellow-900/40 text-yellow-400'
                        }`}>
                          {offer.status === 'analyzed' ? t('dashboard.table.analyzed') :
                           offer.status === 'error'    ? t('dashboard.table.error') : t('dashboard.table.pending')}
                        </span>
                      </td>
                      <td className="py-3">
                        {offer.status === 'analyzed' && (
                          <Link
                            to={`/analysis/${offerId}`}
                            className="text-gold hover:text-gold-light text-xs font-medium"
                          >
                            {t('dashboard.table.view')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageLayout>
  );
}
