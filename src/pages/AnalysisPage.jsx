/**
 * Analysis Results Page
 * Displays AI-powered mortgage analysis results
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useToast } from '../context/ToastContext';
import { getAnalysis, getOffers } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { SkeletonCard } from '../components/common/Skeleton';

/**
 * Generate payment comparison data for chart
 */
function generatePaymentData(offerRate, recommendedRate, amount = 1200000, term = 300) {
  const data = [];
  const monthlyOffer = (amount * (offerRate / 100 / 12)) / (1 - Math.pow(1 + offerRate / 100 / 12, -term));
  const monthlyRec = (amount * (recommendedRate / 100 / 12)) / (1 - Math.pow(1 + recommendedRate / 100 / 12, -term));
  const marketRate = offerRate - 0.2;
  const monthlyMarket = (amount * (marketRate / 100 / 12)) / (1 - Math.pow(1 + marketRate / 100 / 12, -term));

  // Sample every 12 months for readability
  for (let month = 0; month <= term; month += 12) {
    data.push({
      month: `Year ${month / 12}`,
      yourOffer: Math.round(monthlyOffer),
      marketBest: Math.round(monthlyMarket),
      mortyRec: Math.round(monthlyRec),
    });
  }
  return data;
}

/**
 * Custom Tooltip for Line Chart
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-surface border border-border rounded-lg p-3 shadow-card">
        <p className="text-sm font-medium text-[#f8fafc] mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs mb-1" style={{ color: entry.color }}>
            {entry.name}: ₪{entry.value?.toLocaleString('he-IL')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Analysis Page Component
 */
const AnalysisPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [allOffers, setAllOffers] = useState([]);

  const fetchAnalysis = useCallback(async () => {
    if (!id) {
      // Load most recent offer if no ID
      try {
        const offersRes = await getOffers();
        const offers = offersRes.data?.offers || [];
        setAllOffers(offers);
        if (offers.length > 0) {
          const latest = offers[0];
          setAnalysis(latest);
        }
      } catch {
        setAllOffers([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const response = await getAnalysis(id);
      setAnalysis(response.data);

      // Poll if still pending
      if (response.data?.status === 'pending') {
        setPolling(true);
        setTimeout(fetchAnalysis, 5000);
      } else {
        setPolling(false);
      }
    } catch (error) {
      toast.error('Failed to load analysis results.');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  // Load all offers for sidebar list
  useEffect(() => {
    if (id) {
      getOffers()
        .then((res) => setAllOffers(res.data?.offers || []))
        .catch(() => {});
    }
  }, [id]);

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </PageLayout>
    );
  }

  if (!analysis) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-[#334155] mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-2">
            No Analysis Found
          </h2>
          <p className="text-[#94a3b8] mb-6">
            Upload a mortgage offer to get started
          </p>
          <Link to="/upload">
            <Button variant="primary">Upload an Offer</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  // Pending state
  if (analysis.status === 'pending') {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <Spinner size="lg" className="mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-[#f8fafc] mb-2">
            Analysis in Progress
          </h2>
          <p className="text-[#94a3b8]">
            Our AI is analyzing your mortgage offer. This usually takes 1-2 minutes.
          </p>
          {polling && (
            <p className="text-xs text-[#64748b] mt-4">Checking for results...</p>
          )}
        </div>
      </PageLayout>
    );
  }

  const extracted = analysis.extractedData || {};
  const analysisData = analysis.analysis || {};
  const offerRate = extracted.rate || 3.8;
  const recommendedRate = analysisData.recommendedRate || 3.4;
  const chartData = generatePaymentData(offerRate, recommendedRate, extracted.amount || 1200000, (extracted.term || 25) * 12);

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">
          Analysis Results
          {extracted.bank && ` — ${extracted.bank}`}
        </h1>
        <p className="text-[#94a3b8] text-sm">
          {analysis.updatedAt
            ? `Analyzed ${new Date(analysis.updatedAt).toLocaleDateString('en-IL', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}`
            : 'Analysis complete'}
        </p>
      </div>

      {/* AI Summary Card */}
      <Card goldTop className="mb-6 analysis-card">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-gold"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#f8fafc] mb-2">
              AI Summary
            </h2>
            <p className="text-[#94a3b8] leading-relaxed">
              {analysisData.aiReasoning ||
                `Based on your financial profile, this offer is above market rate by ${
                  (offerRate - recommendedRate).toFixed(1)
                }%. Over ${extracted.term || 25} years, you'd pay ₪${
                  (analysisData.savings || 48000).toLocaleString('he-IL')
                } more than the optimal rate available.`}
            </p>
          </div>
        </div>
      </Card>

      {/* Extracted Terms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
            Extracted Terms
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Bank', value: extracted.bank || 'N/A' },
              { label: 'Loan Amount', value: extracted.amount ? `₪${extracted.amount.toLocaleString('he-IL')}` : 'N/A' },
              { label: 'Interest Rate', value: extracted.rate ? `${extracted.rate}%` : 'N/A' },
              { label: 'Term', value: extracted.term ? `${extracted.term} years` : 'N/A' },
              { label: 'Monthly Payment', value: extracted.monthlyPayment ? `₪${extracted.monthlyPayment.toLocaleString('he-IL')}` : 'N/A' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-[#94a3b8]">{label}</span>
                <span className="text-sm font-medium text-[#f8fafc]">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
            Morty's Recommendation
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Recommended Rate', value: `${recommendedRate}%`, highlight: true },
              { label: 'Potential Savings', value: `₪${(analysisData.savings || 48000).toLocaleString('he-IL')}`, highlight: true },
              { label: 'Rate Difference', value: `${(offerRate - recommendedRate).toFixed(2)}%` },
              { label: 'Optimal Term', value: `${Math.max(20, (extracted.term || 25) - 5)} years` },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-[#94a3b8]">{label}</span>
                <span className={`text-sm font-medium ${highlight ? 'text-gold' : 'text-[#f8fafc]'}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Comparison Chart */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-6">
          Payment Comparison Over Time
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                interval={4}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="yourOffer"
                name="Your Offer"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="marketBest"
                name="Market Best"
                stroke="#94a3b8"
                strokeWidth={2}
                dot={false}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="mortyRec"
                name="Morty Recommendation"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
          Recommendations
        </h2>
        <div className="space-y-3">
          {[
            {
              num: 1,
              text: `Negotiate rate to ${recommendedRate}% — saves ₪${Math.round((analysisData.savings || 48000) * 0.67).toLocaleString('he-IL')}`,
            },
            {
              num: 2,
              text: `Consider ${Math.max(20, (extracted.term || 25) - 5)}-year term — total cost -₪${Math.round((analysisData.savings || 48000) * 0.33).toLocaleString('he-IL')}`,
            },
            {
              num: 3,
              text: 'Compare with other bank offers for better leverage in negotiations',
            },
          ].map(({ num, text }) => (
            <div key={num} className="flex items-start gap-4 p-3 bg-navy-elevated rounded-lg">
              <div className="w-6 h-6 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gold">{num}</span>
              </div>
              <p className="text-sm text-[#94a3b8]">{text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="ghost" onClick={() => window.print()}>
          Download Report PDF
        </Button>
        <Link to="/upload">
          <Button variant="primary">Upload Another Offer</Button>
        </Link>
      </div>
    </PageLayout>
  );
};

export default AnalysisPage;
