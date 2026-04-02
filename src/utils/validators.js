/**
 * Validation Utilities
 * Common validation functions for forms
 */

/**
 * Validate Israeli phone number
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidIsraeliPhone(phone) {
  return /^(\+972|0)[0-9]{8,9}$/.test(phone);
}

/**
 * Validate email address
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format number as Israeli currency
 * @param {number} value
 * @returns {string}
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format number with thousands separator
 * @param {number} value
 * @returns {string}
 */
export function formatNumber(value) {
  return new Intl.NumberFormat('he-IL').format(value);
}

/**
 * Calculate mortgage monthly payment
 * @param {number} principal - Loan amount
 * @param {number} annualRate - Annual interest rate (percentage)
 * @param {number} termYears - Loan term in years
 * @returns {number} Monthly payment
 */
export function calculateMonthlyPayment(principal, annualRate, termYears) {
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) return principal / numPayments;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

/**
 * Calculate total interest paid over loan term
 * @param {number} monthlyPayment
 * @param {number} termYears
 * @param {number} principal
 * @returns {number} Total interest
 */
export function calculateTotalInterest(monthlyPayment, termYears, principal) {
  return monthlyPayment * termYears * 12 - principal;
}

/**
 * Format file size in human-readable format
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
