/**
 * PaymentComparisonChart.jsx
 * Reusable Recharts LineChart comparing cumulative mortgage payments
 * across three scenarios: Your Offer, Market Best, and Morty Recommendation.
 */

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Compute monthly payment using standard amortisation formula.
 * @param {number} principal
 * @param {number} annualRate  e.g. 3.8 for 3.8%
 * @param {number} termYears
 * @returns {number}
 */
const monthlyPayment = (principal, annualRate, termYears) => {
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

/**
 * Build yearly cumulative payment series.
 * @param {number} principal
 * @param {number} annualRate
 * @param {number} termYears
 * @returns {number[]}  One entry per year
 */
const buildYearlySeries = (principal, annualRate, termYears) => {
  if (!principal || !annualRate || !termYears) return [];
  const pmt = monthlyPayment(principal, annualRate, termYears);
  return Array.from({ length: termYears }, (_, i) => Math.round(pmt * 12 * (i + 1)));
};

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  const { t } = useTranslation();
  if (!active || !payload || payload.length === 0) return null;

  const formatILS = (val) =>
    new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div
      className="bg-navy-surface border border-border rounded-lg p-3 shadow-card text-sm"
      role="tooltip"
    >
      <p className="text-text-secondary font-medium mb-2">{t('analysis.chart.year')} {label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          <span className="text-text-secondary">{entry.name}:</span>
          <span className="text-text-primary font-semibold">{formatILS(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

/**
 * PaymentComparisonChart
 *
 * @param {object} props
 * @param {number} props.principal        Loan amount in ILS
 * @param {number} props.yourRate         Your offer's annual interest rate (%)
 * @param {number} props.marketRate       Market average annual rate (%)
 * @param {number} props.recommendedRate  Morty's recommended rate (%)
 * @param {number} props.termYears        Loan term in years
 * @param {number} [props.height]         Chart height in px (default 300)
 */
const PaymentComparisonChart = ({
  principal,
  yourRate,
  marketRate,
  recommendedRate,
  termYears,
  height,
}) => {
  const { t } = useTranslation();
  const chartData = useMemo(() => {
    const yourSeries   = buildYearlySeries(principal, yourRate, termYears);
    const marketSeries = buildYearlySeries(principal, marketRate, termYears);
    const mortySeries  = buildYearlySeries(principal, recommendedRate, termYears);

    return yourSeries.map((val, idx) => ({
      year:      idx + 1,
      yourOffer: val,
      market:    marketSeries[idx] ?? null,
      morty:     mortySeries[idx] ?? null,
    }));
  }, [principal, yourRate, marketRate, recommendedRate, termYears]);

  if (chartData.length === 0) return null;

  const formatYAxis = (val) =>
    val >= 1_000_000
      ? `₪${(val / 1_000_000).toFixed(1)}M`
      : `₪${(val / 1_000).toFixed(0)}K`;

  return (
    <div
      className="rounded-card bg-navy-surface border border-border p-6"
      role="region"
      aria-label={t('analysis.chart.cumulativeTitle')}
    >
      <h3 className="text-sm font-label uppercase tracking-widest text-text-secondary mb-4">
        {t('analysis.chart.cumulativeTitle')}
      </h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="year"
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            label={{
              value: t('analysis.chart.year'),
              position: 'insideBottom',
              offset: -10,
              fill: '#64748b',
              fontSize: 12,
            }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            tickFormatter={formatYAxis}
            width={70}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              color: '#94a3b8',
              fontSize: '12px',
              paddingTop: '24px',
            }}
          />
          {/* Highlight the savings area between your offer and Morty rec */}
          <Line
            type="monotone"
            dataKey="yourOffer"
            name={t('analysis.chart.yourOffer')}
            stroke="#ef4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#ef4444' }}
          />
          <Line
            type="monotone"
            dataKey="market"
            name={t('analysis.chart.market')}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            activeDot={{ r: 4, fill: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="morty"
            name={t('analysis.chart.morty')}
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

PaymentComparisonChart.propTypes = {
  principal:       PropTypes.number.isRequired,
  yourRate:        PropTypes.number.isRequired,
  marketRate:      PropTypes.number,
  recommendedRate: PropTypes.number,
  termYears:       PropTypes.number.isRequired,
  height:          PropTypes.number,
};

PaymentComparisonChart.defaultProps = {
  marketRate:      null,
  recommendedRate: null,
  height:          300,
};

export default PaymentComparisonChart;
