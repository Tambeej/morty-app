/**
 * validators.js
 * Client-side validation helpers and API error extraction utilities.
 */

/**
 * Extracts a human-readable error message from an Axios error response.
 * Handles the backend error shape: { success: false, error: { message } }
 * as well as plain string errors and network errors.
 *
 * @param {Error} err - The error thrown by Axios (or any Error).
 * @param {string} [fallback='An unexpected error occurred'] - Fallback message.
 * @returns {string} Human-readable error message.
 */
export function extractApiError(err, fallback = 'An unexpected error occurred') {
  if (!err) return fallback;

  // Axios response error
  if (err.response) {
    const data = err.response.data;
    if (data) {
      // Backend shape: { success: false, error: { message } }
      if (data.error && typeof data.error === 'object' && data.error.message) {
        return data.error.message;
      }
      // Backend shape: { success: false, error: 'string' }
      if (typeof data.error === 'string') {
        return data.error;
      }
      // Generic message field
      if (typeof data.message === 'string') {
        return data.message;
      }
    }
    // HTTP status text fallback
    if (err.response.statusText) {
      return err.response.statusText;
    }
  }

  // Network / timeout errors
  if (err.request) {
    return 'Network error — please check your connection.';
  }

  // Plain JS error
  if (err.message) {
    return err.message;
  }

  return fallback;
}

// ---------------------------------------------------------------------------
// Field-level validators (used with React Hook Form)
// ---------------------------------------------------------------------------

/**
 * Validates an email address.
 * @param {string} value
 * @returns {true|string}
 */
export function validateEmail(value) {
  if (!value) return 'Email is required';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) return 'Enter a valid email address';
  return true;
}

/**
 * Validates a password (min 8 chars, at least one letter and one number).
 * @param {string} value
 * @returns {true|string}
 */
export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return true;
}

/**
 * Validates an Israeli phone number.
 * Accepts formats: 05X-XXXXXXX, +97250XXXXXXX, 05XXXXXXXXX
 * @param {string} value
 * @returns {true|string}
 */
export function validateIsraeliPhone(value) {
  if (!value) return 'Phone number is required';
  const cleaned = value.replace(/[\s\-]/g, '');
  const re = /^(\+972|972|0)(5[0-9])(\d{7})$/;
  if (!re.test(cleaned)) return 'Enter a valid Israeli phone number (e.g. 050-1234567)';
  return true;
}

/**
 * Validates a positive monetary amount (ILS).
 * @param {string|number} value
 * @returns {true|string}
 */
export function validatePositiveAmount(value) {
  if (value === '' || value === null || value === undefined) return 'Amount is required';
  const num = Number(value);
  if (isNaN(num)) return 'Enter a valid number';
  if (num < 0) return 'Amount cannot be negative';
  return true;
}

/**
 * Validates that two password fields match.
 * @param {string} password - The original password value.
 * @returns {(value: string) => true|string}
 */
export function validatePasswordMatch(password) {
  return (value) => {
    if (!value) return 'Please confirm your password';
    if (value !== password) return 'Passwords do not match';
    return true;
  };
}

/**
 * Validates a full name (at least two words).
 * @param {string} value
 * @returns {true|string}
 */
export function validateFullName(value) {
  if (!value || !value.trim()) return 'Full name is required';
  if (value.trim().split(/\s+/).length < 2) return 'Please enter your first and last name';
  return true;
}
