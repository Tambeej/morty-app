/**
 * Formatting utility functions for the Morty application.
 * Handles currency, numbers, dates, and percentages in Israeli locale.
 *
 * Firestore alignment:
 *   - formatDate() and formatTimestamp() accept ISO strings (Firestore Admin SDK)
 *     as well as Firestore Timestamp objects (client SDK) and Date objects.
 */
import { isFirestoreTimestamp, normalizeTimestamp } from './firestoreUtils';

/**
 * Format a number as Israeli Shekel currency
 * @param {number} amount - The amount to format
 * @param {boolean} [showSymbol=true] - Whether to show the ₪ symbol
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showSymbol = true) => {
  if (amount === null || amount === undefined || isNaN(amount)) return showSymbol ? '₪0' : '0';
  const formatted = new Intl.NumberFormat('he-IL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return showSymbol ? `₪${formatted}` : formatted;
};

/**
 * Format a number with thousands separators
 * @param {number} value
 * @returns {string}
 */
export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return new Intl.NumberFormat('he-IL').format(value);
};

/**
 * Format a percentage value
 * @param {number} value - The percentage (e.g., 3.5 for 3.5%)
 * @param {number} [decimals=2] - Number of decimal places
 * @returns {string}
 */
export const formatPercent = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format a date to a human-readable string in Israeli locale.
 * Accepts ISO strings (Firestore timestamps) or Date objects.
 *
 * @param {string|Date|null|undefined} iso - ISO date string or Date object
 * @param {Object} [options] - Intl.DateTimeFormat options override
 * @returns {string} Formatted date string, or '—' if falsy
 */
export const formatDate = (iso, options = {}) => {
  if (!iso) return '\u2014'; // em-dash '—'
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  try {
    return new Intl.DateTimeFormat('he-IL', defaultOptions).format(new Date(iso));
  } catch {
    return '\u2014';
  }
};

/**
 * Format a Firestore timestamp (or ISO string / Date) to a human-readable string.
 *
 * This is the Firestore-aware version of formatDate. It handles:
 *   - Firestore Timestamp objects (client SDK): `{ seconds, nanoseconds, toDate() }`
 *   - ISO strings (backend Admin SDK): `'2026-04-03T02:16:00.000Z'`
 *   - JavaScript Date objects
 *   - null / undefined → returns '—'
 *
 * @param {object|string|Date|null|undefined} value - Timestamp value
 * @param {Object} [options] - Intl.DateTimeFormat options override
 * @returns {string} Formatted date string in he-IL locale, or '—' if invalid
 *
 * @example
 *   formatTimestamp('2026-04-03T02:16:00.000Z')  // → '3 באפר׳ 2026'
 *   formatTimestamp(new Date('2026-04-03'))        // → '3 באפר׳ 2026'
 *   formatTimestamp({ seconds: 1743645360, nanoseconds: 0, toDate: () => new Date(1743645360000) })
 *   formatTimestamp(null)                          // → '—'
 */
export const formatTimestamp = (value, options = {}) => {
  if (value === null || value === undefined) return '\u2014';

  // Handle Firestore Timestamp objects (client SDK)
  if (isFirestoreTimestamp(value)) {
    try {
      const date = value.toDate();
      return formatDate(date, options);
    } catch {
      return '\u2014';
    }
  }

  // Handle serialized Firestore Timestamp (e.g., { seconds, nanoseconds })
  if (typeof value === 'object' && !(value instanceof Date) && typeof value.seconds === 'number') {
    try {
      const date = new Date(value.seconds * 1000);
      return formatDate(date, options);
    } catch {
      return '\u2014';
    }
  }

  // Delegate to formatDate for ISO strings and Date objects
  return formatDate(value, options);
};

/**
 * Format a relative time (e.g., "2 minutes ago")
 * @param {string|Date} date
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  // Normalize Firestore Timestamp if needed
  const isoDate = isFirestoreTimestamp(date) ? normalizeTimestamp(date) : date;
  const now = new Date();
  const then = new Date(isoDate);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return formatDate(isoDate);
};

/**
 * Format file size in human-readable format
 * @param {number} bytes
 * @returns {string}
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

/**
 * Format mortgage term in years
 * @param {number} months - Term in months
 * @returns {string}
 */
export const formatTerm = (months) => {
  if (!months) return '';
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years}y ${remainingMonths}m`;
};

/**
 * Parse a formatted number string back to a number
 * @param {string} value - Formatted string (e.g., "50,000")
 * @returns {number}
 */
export const parseFormattedNumber = (value) => {
  if (!value) return 0;
  return Number(String(value).replace(/[^0-9.-]/g, '')) || 0;
};
