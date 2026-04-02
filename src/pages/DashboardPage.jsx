/**
 * DashboardPage.jsx
 * Main dashboard showing mortgage analysis summary, stats, charts, and recent offers.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/validators';
import Skeleton from '../components/common/Skeleton';
import PageLayout from '../components/layout/PageLayout';

const StatCard = ({ label, value, sub, icon }) => (
  <div
    style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '24px',
      flex: '1 1 200px',
      transition: 'transform 200ms, border-color 200ms',
      cursor: 'default',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = '#f59e0b';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.borderColor = '#334155';
    }}
  >
    <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{icon}</div>
    <div style={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
    <div style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    {sub && <div style={{ color: '#64748b', fontSize: '0.8125rem', marginTop: '4px' }}>{sub}</div>}
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data.data);
    } catch (err) {
      addToast(extractApiError(err, 'Failed to load dashboard'), 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const summary = data?.summary || {};
  const comparisonData = data?.comparisonData || [];
  const recentOffers = data?.recentOffers || [];

  const firstName = user?.fullName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  return (
    <PageLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px' }}>Here's your mortgage analysis summary</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} style={{ flex: '1 1 200px', background: '#1e293b', borderRadius: '12px', padding: '24px' }}>
                <Skeleton height="1rem" width="60%" style={{ marginBottom: '8px' }} />
                <Skeleton height="2rem" width="80%" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                icon="📉"
                label="Best Rate"
                value={summary.bestRate != null ? `${summary.bestRate}%` : '—'}
                sub={summary.rateVsMarket != null ? `${summary.rateVsMarket > 0 ? '+' : ''}${summary.rateVsMarket}% vs market` : undefined}
              />
              <StatCard
                icon="💰"
                label="Potential Savings"
                value={summary.totalPotentialSavings != null ? `₪${summary.totalPotentialSavings.toLocaleString('he-IL')}` : '—'}
                sub="lifetime savings"
              />
              <StatCard
                icon="📄"
                label="Active Offers"
                value={summary.totalOffers ?? '—'}
                sub={`${summary.analyzedOffers ?? 0} analyzed`}
              />
            </>
          )}
        </div>

        {/* Bar chart */}
        {!loading && comparisonData.length > 0 && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
            }}
          >
            <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px' }}>
              Monthly Payment Comparison
            </h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={comparisonData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bank" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                  itemStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8125rem' }} />
                <Bar dataKey="monthlyPayment" name="Monthly Payment (₪)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent offers table */}
        <div
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>Recent Offers</h2>
            <button
              onClick={() => navigate('/upload')}
              style={{
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              + Upload New Offer
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height="40px" />)}
            </div>
          ) : recentOffers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p style={{ fontSize: '1rem' }}>No offers yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Upload your first mortgage offer to get started.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Bank', 'Rate', 'Term', 'Monthly Payment', 'Status'].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: 'left',
                          padding: '8px 12px',
                          color: '#64748b',
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '1px solid #334155',
                        }}
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
                      onClick={() => navigate(`/analysis/${offer._id}`)}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#273549')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '12px', color: '#f8fafc', fontSize: '0.875rem', borderBottom: '1px solid #1e293b' }}>
                        {offer.extractedData?.bank || '—'}
                      </td>
                      <td style={{ padding: '12px', color: '#f8fafc', fontSize: '0.875rem', borderBottom: '1px solid #1e293b' }}>
                        {offer.extractedData?.rate != null ? `${offer.extractedData.rate}%` : '—'}
                      </td>
                      <td style={{ padding: '12px', color: '#f8fafc', fontSize: '0.875rem', borderBottom: '1px solid #1e293b' }}>
                        {offer.extractedData?.term != null ? `${offer.extractedData.term} yr` : '—'}
                      </td>
                      <td style={{ padding: '12px', color: '#f8fafc', fontSize: '0.875rem', borderBottom: '1px solid #1e293b' }}>
                        {offer.analysis?.monthlyPayment != null
                          ? `₪${offer.analysis.monthlyPayment.toLocaleString('he-IL')}`
                          : '—'}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #1e293b' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 10px',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background:
                              offer.status === 'analyzed' ? 'rgba(16,185,129,0.15)'
                              : offer.status === 'error' ? 'rgba(239,68,68,0.15)'
                              : 'rgba(245,158,11,0.15)',
                            color:
                              offer.status === 'analyzed' ? '#10b981'
                              : offer.status === 'error' ? '#ef4444'
                              : '#f59e0b',
                          }}
                        >
                          {offer.status}
                        </span>
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
};

export default DashboardPage;
