import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { apiService } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

/**
 * Main dashboard page showing mortgage analysis summary.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [dashData, offersData] = await Promise.all([
          apiService.getDashboard(),
          apiService.getOffers()
        ]);
        setDashboard(dashData);
        setOffers(offersData);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const chartData = offers.slice(0, 3).map((o, i) => ({
    name: o.extractedData?.bank || `Offer ${i + 1}`,
    monthly: o.extractedData?.monthlyPayment || 0,
    recommended: o.analysis?.recommendedRate ? Math.round(o.extractedData?.amount / (o.extractedData?.term * 12)) : 0
  }));

  return (
    <PageLayout>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc]">
          Welcome back, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-[#94a3b8] mt-1">Here&apos;s your mortgage analysis summary</p>
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
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">Best Rate</p>
            <p className="text-3xl font-bold text-gold">{dashboard?.bestRate ?? '—'}%</p>
            <p className="text-sm text-[#64748b] mt-1">
              {dashboard?.rateVsMarket ? `${dashboard.rateVsMarket > 0 ? '+' : ''}${dashboard.rateVsMarket}% vs market` : 'No data yet'}
            </p>
          </Card>

          <Card interactive>
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">Potential Savings</p>
            <p className="text-3xl font-bold text-gold">
              {dashboard?.potentialSavings ? `₪${dashboard.potentialSavings.toLocaleString('he-IL')}` : '—'}
            </p>
            <p className="text-sm text-[#64748b] mt-1">lifetime savings</p>
          </Card>

          <Card interactive>
            <p className="text-xs font-medium uppercase tracking-widest text-[#94a3b8] mb-2">Active Offers</p>
            <p className="text-3xl font-bold text-gold">{offers.length}</p>
            <p className="text-sm text-[#64748b] mt-1">uploaded offers</p>
          </Card>
        </div>
      )}

      {/* Chart */}
      {!loading && chartData.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Monthly Payment Comparison</h2>
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
              <Bar dataKey="monthly" name="Your Offer" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recommended" name="Recommended" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Offers table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#f8fafc]">Your Offers</h2>
          <Link to="/upload">
            <Button variant="ghost" className="text-sm py-2 px-4">+ Upload New Offer</Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => <Skeleton key={i} height="44px" />)}
          </div>
        ) : offers.length === 0 ? (
          <p className="text-[#64748b] text-sm py-4 text-center">
            No offers yet.{' '}
            <Link to="/upload" className="text-gold hover:underline">Upload your first offer →</Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-[#64748b] text-left">
                  <th className="pb-3 font-medium">Bank</th>
                  <th className="pb-3 font-medium">Rate</th>
                  <th className="pb-3 font-medium">Term</th>
                  <th className="pb-3 font-medium">Monthly</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer._id} className="border-b border-border/50 hover:bg-navy-elevated transition-colors">
                    <td className="py-3 text-[#f8fafc]">{offer.extractedData?.bank || '—'}</td>
                    <td className="py-3 text-[#94a3b8]">{offer.extractedData?.rate ? `${offer.extractedData.rate}%` : '—'}</td>
                    <td className="py-3 text-[#94a3b8]">{offer.extractedData?.term ? `${offer.extractedData.term}yr` : '—'}</td>
                    <td className="py-3 text-[#94a3b8]">{offer.extractedData?.monthlyPayment ? `₪${offer.extractedData.monthlyPayment.toLocaleString('he-IL')}` : '—'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        offer.status === 'analyzed' ? 'bg-green-900/40 text-green-400' :
                        offer.status === 'error'    ? 'bg-red-900/40 text-red-400' :
                        'bg-yellow-900/40 text-yellow-400'
                      }`}>
                        {offer.status === 'analyzed' ? '✓ Analyzed' :
                         offer.status === 'error'    ? '✗ Error' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      {offer.status === 'analyzed' && (
                        <Link
                          to={`/analysis/${offer._id}`}
                          className="text-gold hover:text-gold-light text-xs font-medium"
                        >
                          View Results →
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
