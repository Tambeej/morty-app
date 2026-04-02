/**
 * validators.js - Shared validation utilities.
 */

/**
 * Validate Israeli phone number.
 * Accepts formats: +972XXXXXXXXX, 0XXXXXXXXX
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidIsraeliPhone(phone) {
  return /^(\+972|0)[0-9]{8,9}$/.test(phone);
}

/**
 * Validate email address.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format a number as Israeli currency (ILS).
 * @param {number} value
 * @returns {string}
 */
export function formatILS(value) {
  if (value == null || isNaN(value)) return '—';
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number with thousands separators.
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  if (value == null || isNaN(value)) return '';
  return new Intl.NumberFormat('he-IL').format(value);
}

/**
 * Format a percentage.
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
export function formatPercent(value, decimals = 2) {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Validate file type for mortgage offer uploads.
 * @param {File} file
 * @returns {boolean}
 */
export function isValidOfferFile(file) {
  const ACCEPTED = ['application/pdf', 'image/png', 'image/jpeg'];
  return ACCEPTED.includes(file.type);
}

/**
 * Validate file size (max 5MB).
 * @param {File} file
 * @returns {boolean}
 */
export function isValidFileSize(file) {
  return file.size <= 5 * 1024 * 1024;
}
