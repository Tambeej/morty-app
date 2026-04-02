/**
 * Client-side validation utilities for Morty forms.
 */

/**
 * Validate Israeli phone number.
 * Accepts formats: +972XXXXXXXXX, 0XXXXXXXXX
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidIsraeliPhone = (phone) => {
  return /^(\+972|0)[0-9]{8,9}$/.test(phone);
};

/**
 * Validate email address.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate password strength.
 * Must have: min 8 chars, uppercase, lowercase, digit.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must include an uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must include a lowercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must include a number' };
  }
  return { valid: true, message: '' };
};

/**
 * Format a number as Israeli currency string.
 * @param {number} value
 * @returns {string} e.g. "1,234,567"
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return Number(value).toLocaleString('he-IL');
};

/**
 * Parse a formatted currency string back to a number.
 * @param {string} str
 * @returns {number}
 */
export const parseCurrency = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/,/g, '')) || 0;
};

/**
 * Calculate mortgage monthly payment using standard formula.
 * @param {number} principal - Loan amount in ILS
 * @param {number} annualRate - Annual interest rate (e.g. 3.5 for 3.5%)
 * @param {number} termYears - Loan term in years
 * @returns {number} Monthly payment amount
 */
export const calcMonthlyPayment = (principal, annualRate, termYears) => {
  if (!principal || !annualRate || !termYears) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  if (r === 0) return principal / n;
  return Math.round(
    (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
  );
};
