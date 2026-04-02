/**
 * validators.js - Form validation schemas and utility functions.
 * Uses Zod for schema-based validation.
 */

/**
 * Validate email format.
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Israeli phone number format.
 * Accepts: 05X-XXXXXXX, +972-5X-XXXXXXX, 05XXXXXXXX
 * @param {string} phone
 * @returns {boolean}
 */
export const isValidIsraeliPhone = (phone) => {
  const phoneRegex = /^(\+972|0)(5[0-9])([-]?)(\d{7})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate password strength.
 * Minimum 8 characters, at least one letter and one number.
 * @param {string} password
 * @returns {{ valid: boolean, message: string }}
 */
export const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true, message: '' };
};

/**
 * Login form validation rules for React Hook Form.
 */
export const loginValidationRules = {
  email: {
    required: 'Email is required',
    validate: (value) => isValidEmail(value) || 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    minLength: {
      value: 8,
      message: 'Password must be at least 8 characters',
    },
  },
};

/**
 * Registration form validation rules for React Hook Form.
 */
export const registerValidationRules = {
  fullName: {
    required: 'Full name is required',
    minLength: {
      value: 2,
      message: 'Name must be at least 2 characters',
    },
    maxLength: {
      value: 100,
      message: 'Name must be less than 100 characters',
    },
  },
  phone: {
    required: 'Phone number is required',
    validate: (value) =>
      isValidIsraeliPhone(value) || 'Please enter a valid Israeli phone number (e.g., 050-1234567)',
  },
  email: {
    required: 'Email is required',
    validate: (value) => isValidEmail(value) || 'Please enter a valid email address',
  },
  password: {
    required: 'Password is required',
    validate: (value) => {
      const result = validatePassword(value);
      return result.valid || result.message;
    },
  },
  confirmPassword: (getValues) => ({
    required: 'Please confirm your password',
    validate: (value) => value === getValues('password') || 'Passwords do not match',
  }),
};

/**
 * Format Israeli phone number to standard format.
 * @param {string} phone
 * @returns {string}
 */
export const formatIsraeliPhone = (phone) => {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+972')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '+972' + cleaned.slice(1);
  }
  return phone;
};

/**
 * Format number with Israeli locale (commas).
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return new Intl.NumberFormat('he-IL').format(value);
};
