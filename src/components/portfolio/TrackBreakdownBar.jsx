/**
 * TrackBreakdownBar.jsx
 * Visual percentage bars for each mortgage track in a portfolio.
 * Shows track name, rate, and percentage allocation.
 */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Color mapping per track type.
 */
const TRACK_COLORS = {
  fixed: '#1A3C5E',      // primary navy - fixed/קל"צ
  cpi: '#0D6EFD',        // blue - CPI-linked/צמוד מדד
  prime: '#00C896',      // accent green - prime/פריים
  variable: '#8B5CF6',   // purple - variable/משתנה
};

/**
 * Hebrew labels for track types.
 */
const TRACK_LABELS = {
  fixed: 'קל"צ (קבועה לא צמודה)',
  cpi: 'צמוד מדד',
  prime: 'פריים',
  variable: 'משתנה לא צמודה',
};

/**
 * Get display color for a track.
 */
function getTrackColor(trackType) {
  return TRACK_COLORS[trackType] || '#94A3B8';
}

/**
 * Get Hebrew label for a track.
 */
function getTrackLabel(track) {
  // Prefer the Hebrew name from API, fall back to our mapping, then English name
  return track.name || TRACK_LABELS[track.type] || track.nameEn || track.type;
}

/**
 * Format rate display string.
 */
function formatRateDisplay(track) {
  if (track.rateDisplay) return track.rateDisplay;
  if (track.rate !== undefined && track.rate !== null) {
    return `${Number(track.rate).toFixed(2)}%`;
  }
  return '';
}

/**
 * TrackBreakdownBar component.
 *
 * @param {Array} tracks - Array of track objects from portfolio
 */
export default function TrackBreakdownBar({ tracks }) {
  if (!tracks || tracks.length === 0) {
    return (
      <p className="text-sm text-text3 italic">אין מסלולים להצגה</p>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="פירוט מסלולי המשכנתא">
      {tracks.map((track, index) => {
        const color = getTrackColor(track.type);
        const label = getTrackLabel(track);
        const rateDisplay = formatRateDisplay(track);
        const percentage = track.percentage || 0;

        return (
          <div
            key={`${track.type}-${index}`}
            role="listitem"
            aria-label={`${label}: ${percentage}% בריבית ${rateDisplay}`}
          >
            {/* Label row */}
            <div className="flex justify-between items-center text-sm mb-1.5">
              <span className="text-text2 font-medium flex items-center gap-1.5">
                {/* Color dot */}
                <span
                  className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                {label}
              </span>
              <span
                className="font-mono text-text1 text-xs tabular-nums"
                dir="ltr"
              >
                {rateDisplay && `${rateDisplay} · `}{percentage}%
              </span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 bg-border rounded-full overflow-hidden"
              role="presentation"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

TrackBreakdownBar.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      nameEn: PropTypes.string,
      type: PropTypes.string,
      percentage: PropTypes.number,
      rate: PropTypes.number,
      rateDisplay: PropTypes.string,
    })
  ),
};

TrackBreakdownBar.defaultProps = {
  tracks: [],
};
