/**
 * AnalysisPage.jsx
 * Displays AI analysis results for a single mortgage offer.
 * Polls for status if the offer is still pending/processing.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/validators';
import Skeleton from '../components/common/Skeleton';
import Spinner from '../components/common/Spinner';
import PageLayout from '../components/layout/PageLayout';

const POLL_INTERVAL = 5000;

const AnalysisPage = () => {
  const { id } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await api.get(`/analysis/${id}`);
      const result = res.data.data;
      setData(result);
      // Stop polling once analyzed or errored
      if (result.status === 'analyzed' || result.status === 'error') {
        if (pollRef.current) clearInterval(pollRef.current);
      }
    } catch (err) {
      addToast(extractApiError(err, 'Failed to load analysis'), 'error');
      if (pollRef.current) clearInterval(pollRef.current);
    } finally {
      setLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    fetchAnalysis();
    pollRef.current = setInterval(fetchAnalysis, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchAnalysis]);

  // Build comparison chart data (monthly payments over time)
  const buildChartData = (analysis) => {
    if (!analysis) return [];
    const months = analysis.term ? analysis.term * 12 : 300;
    const step = Math.max(1, Math.floor(months / 30));
    const data = [];
    for (let m = step; m <= months; m += step) {
      data.push({
        month: m,
        yourOffer: analysis.monthlyPayment || 0,
        recommended: analysis.recommendedRate
          ? Math.round(
              ((analysis.extractedData?.amount || 1000000) *
                (analysis.recommendedRate / 100 / 12)) /
                (1 - Math.pow(1 + analysis.recommendedRate / 100 / 12, -months))
            )
          : 0,
        market: analysis.marketAverageRate
          ? Math.round(
              ((analysis.extractedData?.amount || 1000000) *
                (analysis.marketAverageRate / 100 / 12)) /
                (1 - Math.pow(1 + analysis.marketAverageRate / 100 / 12, -months))
            )
          : 0,
      });
    }
    return data;
  };

  const analysis = data?.analysis;
  const extracted = data?.extractedData;
  const chartData = buildChartData(analysis ? { ...analysis, extractedData: extracted } : null);

  return (
    <PageLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Analysis Results
            {extracted?.bank ? ` — ${extracted.bank}` : ''}
          </h1>
          {data?.createdAt && (
            <p style={{ color: '#94a3b8', marginTop: '6px', fontSize: '0.875rem' }}>
              Analyzed {new Date(data.createdAt).toLocaleString('he-IL')}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} height="120px" borderRadius="12px" />)}
          </div>
        ) : !data ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <p>Analysis not found.</p>
          </div>
        ) : data.status === 'pending' || data.status === 'processing' ? (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '48px',
              textAlign: 'center',
            }}
          >
            <Spinner size={40} />
            <p style={{ color: '#94a3b8', marginTop: '16px', fontSize: '1rem' }}>
              AI is analyzing your offer...
            </p>
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>This usually takes 30–60 seconds.</p>
          </div>
        ) : data.status === 'error' ? (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600 }}>Analysis failed</p>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '8px' }}>
              We couldn't analyze this offer. Please try uploading again.
            </p>
            <button
              onClick={() => navigate('/upload')}
              style={{
                marginTop: '16px',
                background: '#f59e0b',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Upload Another
            </button>
          </div>
        ) : (
          <>
            {/* AI Summary card */}
            {analysis?.aiReasoning && (
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderTop: '3px solid #f59e0b',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h2 style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                  AI Summary
                </h2>
                <p style={{ color: '#f8fafc', fontSize: '1rem', lineHeight: 1.6 }}>
                  {analysis.aiReasoning}
                </p>
              </div>
            )}

            {/* Extracted terms */}
            <div
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
                Extracted Terms
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                {[
                  { label: 'Bank', value: extracted?.bank || '—' },
                  { label: 'Loan Amount', value: extracted?.amount != null ? `₪${extracted.amount.toLocaleString('he-IL')}` : '—' },
                  { label: 'Interest Rate', value: extracted?.rate != null ? `${extracted.rate}%` : '—' },
                  { label: 'Term', value: extracted?.term != null ? `${extracted.term} years` : '—' },
                  { label: 'Monthly Payment', value: analysis?.monthlyPayment != null ? `₪${analysis.monthlyPayment.toLocaleString('he-IL')}` : '—' },
                  { label: 'Total Cost', value: analysis?.totalCost != null ? `₪${analysis.totalCost.toLocaleString('he-IL')}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{label}</div>
                    <div style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison chart */}
            {chartData.length > 0 && (
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, marginBottom: '20px' }}>
                  Payment Comparison Over Time
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f8fafc' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.8125rem' }} />
                    <Line type="monotone" dataKey="yourOffer" name="Your Offer" stroke="#ef4444" dot={false} strokeWidth={2} />
                    <Line type="monotone" dataKey="market" name="Market Average" stroke="#64748b" dot={false} strokeWidth={2} strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="recommended" name="Morty Recommended" stroke="#f59e0b" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recommendations */}
            {analysis?.recommendations?.length > 0 && (
              <div
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                }}
              >
                <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
                  Recommendations
                </h2>
                <ol style={{ margin: 0, padding: '0 0 0 20px' }}>
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} style={{ color: '#f8fafc', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '8px' }}>
                      {rec}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/upload')}
                style={{
                  background: '#f59e0b',
                  color: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Upload Another
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  background: 'none',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 24px',
                  color: '#94a3b8',
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default AnalysisPage;
