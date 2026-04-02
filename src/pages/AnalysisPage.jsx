import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { apiService } from '../services/api.js';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import Button from '../components/common/Button.jsx';

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
  if (r === 0) return [];
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
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    let interval;

    async function fetchAnalysis() {
      try {
        const data = await apiService.getAnalysis(id);
        setAnalysis(data);
        if (data.status === 'pending') {
          setPolling(true);
          interval = setInterval(async () => {
            try {
              const updated = await apiService.getAnalysis(id);
              setAnalysis(updated);
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
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load analysis.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
    return () => clearInterval(interval);
  }, [id]);

  const extracted = analysis?.extractedData || {};
  const result = analysis?.analysis || {};

  const chartData = extracted.amount && extracted.rate && extracted.term
    ? [
        ...generatePaymentData(extracted.amount, extracted.rate, extracted.term).map((d) => ({
          ...d,
          yourOffer: d.payment,
          recommended: result.recommendedRate
            ? Math.round(
                (extracted.amount * (result.recommendedRate / 100 / 12) *
                  Math.pow(1 + result.recommendedRate / 100 / 12, extracted.term * 12)) /
                  (Math.pow(1 + result.recommendedRate / 100 / 12, extracted.term * 12) - 1)
              )
            : undefined
        }))
      ]
    : [];

  return (
    <PageLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f8fafc]">
            Analysis Results{extracted.bank ? ` — ${extracted.bank}` : ''}
          </h1>
          {analysis?.updatedAt && (
            <p className="text-[#94a3b8] mt-1 text-sm">
              Analyzed {new Date(analysis.updatedAt).toLocaleString()}
            </p>
          )}
          {polling && (
            <p className="text-yellow-400 text-sm mt-1 flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full border-2 border-yellow-400 border-t-transparent animate-spin" />
              Analysis in progress — refreshing automatically...
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton height="120px" className="rounded-card" />
            <Skeleton height="200px" className="rounded-card" />
          </div>
        ) : error ? (
          <Card>
            <p className="text-red-400">{error}</p>
          </Card>
        ) : (
          <>
            {/* AI Summary */}
            {result.aiReasoning && (
              <Card goldTop className="mb-6">
                <p className="text-xs font-medium uppercase tracking-widest text-gold mb-3">AI Summary</p>
                <p className="text-[#f8fafc] leading-relaxed">{result.aiReasoning}</p>
              </Card>
            )}

            {/* Extracted terms */}
            <Card className="mb-6">
              <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Extracted Terms</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Bank',         value: extracted.bank },
                  { label: 'Amount',       value: extracted.amount ? `₪${extracted.amount.toLocaleString('he-IL')}` : undefined },
                  { label: 'Interest Rate',value: extracted.rate ? `${extracted.rate}%` : undefined },
                  { label: 'Term',         value: extracted.term ? `${extracted.term} years` : undefined },
                  { label: 'Monthly Pmt', value: extracted.monthlyPayment ? `₪${extracted.monthlyPayment.toLocaleString('he-IL')}` : undefined },
                  { label: 'Recommended', value: result.recommendedRate ? `${result.recommendedRate}%` : undefined }
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-[#64748b] mb-1">{label}</p>
                    <p className="text-[#f8fafc] font-medium">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Savings highlight */}
            {result.savings && (
              <Card className="mb-6 border-green-800">
                <p className="text-xs font-medium uppercase tracking-widest text-green-400 mb-1">Potential Savings</p>
                <p className="text-3xl font-bold text-green-400">₪{result.savings.toLocaleString('he-IL')}</p>
                <p className="text-[#94a3b8] text-sm mt-1">over the life of the loan</p>
              </Card>
            )}

            {/* Comparison chart */}
            {chartData.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Payment Comparison</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'Month', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `₪${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f8fafc' }}
                      formatter={(v) => [`₪${v.toLocaleString()}`, '']}
                    />
                    <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12 }} />
                    <Line type="monotone" dataKey="yourOffer" name="Your Offer" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    {result.recommendedRate && (
                      <Line type="monotone" dataKey="recommended" name="Recommended" stroke="#10b981" strokeWidth={2} dot={false} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <Card className="mb-6">
                <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Recommendations</h2>
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
              <Button variant="ghost" onClick={() => window.print()}>
                Download Report PDF
              </Button>
              <Link to="/upload">
                <Button>Upload Another</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
