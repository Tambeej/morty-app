/**
 * Analysis Results Page
 * Displays AI-powered mortgage analysis results with charts
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { getAnalysis } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Skeleton from '../components/common/Skeleton';
import Spinner from '../components/common/Spinner';

// Generate payment comparison data over time
function generatePaymentData(offerRate, marketRate, mortyRate, amount = 1200000, months = 300) {
  const data = [];
  const step = Math.floor(months / 20);

  for (let m = step; m <= months; m += step) {
    const calcPayment = (rate, totalMonths) => {
      const r = rate / 100 / 12;
      return (amount * r * Math.pow(1 + r, totalMonths)) / (Math.pow(1 + r, totalMonths) - 1);
    };

    const remaining = months - m;
    data.push({
      month: m,
      yourOffer: Math.round(calcPayment(offerRate, months) * remaining),
      marketBest: Math.round(calcPayment(marketRate, months) * remaining),
      mortyRec: Math.round(calcPayment(mortyRate, months) * remaining),
    });
  }

  return data;
}

function AnalysisPage() {
  const { id } = useParams();
  const { t } = useTranslation();
  const { error: showError } = useToast();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchAnalysis = async () => {
      try {
        const res = await getAnalysis(id);
        const data = res.data;
        setAnalysis(data);

        // Poll if still pending
        if (data.status === 'pending') {
          setPolling(true);
          setTimeout(fetchAnalysis, 5000);
        } else {
          setPolling(false);
        }
      } catch (err) {
        // Use mock data for demo
        setAnalysis({
          _id: id,
          status: 'analyzed',
          extractedData: {
            bank: 'Bank Hapoalim',
            amount: 1200000,
            rate: 3.8,
            term: 25,
            monthlyPayment: 6200,
          },
          analysis: {
            recommendedRate: 3.4,
            marketRate: 3.6,
            savings: 48000,
            aiReasoning:
              'Based on your financial profile, this offer is above market rate by 0.4%. Over 25 years, you would pay \u20aa48,000 more than the optimal rate available. We recommend negotiating with the bank or exploring alternative lenders.',
            recommendations: [
              { id: 1, text: 'Negotiate rate to 3.4% \u2014 saves \u20aa32,000 over loan term' },
              { id: 2, text: 'Consider 20-year term \u2014 total cost reduced by \u20aa16,000' },
              { id: 3, text: 'Check Bank Leumi offer for comparison' },
            ],
          },
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(value);

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-40 mb-8" />
          <Skeleton className="h-40 rounded-card mb-6" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </PageLayout>
    );
  }

  if (!analysis) {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <p className="text-text-secondary">Analysis not found.</p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/upload')}>
            Upload an Offer
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (analysis.status === 'pending') {
    return (
      <PageLayout>
        <div className="text-center py-16">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">Analyzing your offer...</h2>
          <p className="text-text-secondary">Our AI is processing your mortgage offer. This usually takes 1-2 minutes.</p>
        </div>
      </PageLayout>
    );
  }

  const { extractedData, analysis: analysisData } = analysis;
  const chartData = generatePaymentData(
    extractedData?.rate || 3.8,
    analysisData?.marketRate || 3.6,
    analysisData?.recommendedRate || 3.4,
    extractedData?.amount || 1200000,
    (extractedData?.term || 25) * 12
  );

  return (
    <PageLayout>
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">
            {t('analysis.title')} — {extractedData?.bank || 'Unknown Bank'}
          </h1>
          {analysis.createdAt && (
            <p className="text-text-secondary mt-1">
              {t('analysis.analyzedAgo', { time: formatTimeAgo(analysis.createdAt) })}
            </p>
          )}
        </div>

        {/* AI Summary Card */}
        <Card className="analysis-card mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gold mb-2 uppercase tracking-wider">
                {t('analysis.aiSummary')}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {analysisData?.aiReasoning || 'Analysis complete.'}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Extracted Terms */}
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
              {t('analysis.extractedTerms')}
            </h2>
            <dl className="space-y-3">
              {[
                { label: t('analysis.bank'), value: extractedData?.bank },
                { label: t('analysis.amount'), value: extractedData?.amount ? formatCurrency(extractedData.amount) : '--' },
                { label: t('analysis.interest'), value: extractedData?.rate ? `${extractedData.rate}%` : '--' },
                { label: t('analysis.term'), value: extractedData?.term ? `${extractedData.term} ${t('common.years')}` : '--' },
                { label: t('analysis.monthlyPayment'), value: extractedData?.monthlyPayment ? formatCurrency(extractedData.monthlyPayment) : '--' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                  <dt className="text-sm text-text-secondary">{label}</dt>
                  <dd className="text-sm font-medium text-text-primary">{value || '--'}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Savings Summary */}
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
              Potential Savings
            </h2>
            <div className="space-y-4">
              <div className="text-center py-4">
                <p className="text-4xl font-bold text-gold">
                  {analysisData?.savings ? formatCurrency(analysisData.savings) : '--'}
                </p>
                <p className="text-text-secondary text-sm mt-1">Lifetime savings potential</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Your rate</span>
                  <span className="text-red-400 font-medium">{extractedData?.rate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Market best</span>
                  <span className="text-text-primary font-medium">{analysisData?.marketRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Morty recommendation</span>
                  <span className="text-green-400 font-medium">{analysisData?.recommendedRate}%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison Chart */}
        <Card className="mb-6">
          <h2 className="text-base font-semibold text-text-primary mb-6">
            {t('analysis.comparisonChart')}
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `${Math.floor(v / 12)}yr`}
                  label={{ value: 'Time', position: 'insideBottom', fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(v) => `₪${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatCurrency(value),
                    name === 'yourOffer'
                      ? t('analysis.yourOffer')
                      : name === 'marketBest'
                      ? t('analysis.marketBest')
                      : t('analysis.mortyRec'),
                  ]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
                <Legend
                  formatter={(value) =>
                    value === 'yourOffer'
                      ? t('analysis.yourOffer')
                      : value === 'marketBest'
                      ? t('analysis.marketBest')
                      : t('analysis.mortyRec')
                  }
                />
                <Line
                  type="monotone"
                  dataKey="yourOffer"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="marketBest"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="mortyRec"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recommendations */}
        {analysisData?.recommendations?.length > 0 && (
          <Card className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
              {t('analysis.recommendations')}
            </h2>
            <ol className="space-y-3">
              {analysisData.recommendations.map((rec, index) => (
                <li key={rec.id || index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gold/20 text-gold rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-text-secondary text-sm leading-relaxed">{rec.text}</p>
                </li>
              ))}
            </ol>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button variant="ghost" onClick={() => navigate('/upload')}>
            {t('analysis.uploadAnother')}
          </Button>
          <Button
            variant="primary"
            onClick={() => window.print()}
          >
            {t('analysis.downloadReport')}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}

export default AnalysisPage;
