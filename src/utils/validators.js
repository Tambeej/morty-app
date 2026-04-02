/**
 * Client-side validation utility functions.
 * Used across forms for consistent validation rules.
 */

/**
 * Validate an email address
 * @param {string} email
 * @returns {string|null} Error message or null if valid
 */
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

/**
 * Validate a password
 * @param {string} password
 * @returns {string|null} Error message or null if valid
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

/**
 * Validate that two passwords match
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null} Error message or null if valid
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return null;
};

/**
 * Validate an Israeli phone number
 * @param {string} phone
 * @returns {string|null} Error message or null if valid
 */
export const validateIsraeliPhone = (phone) => {
  if (!phone) return 'Phone number is required';
  // Israeli phone: +972 or 0 followed by 9 digits
  const phoneRegex = /^(\+972|0)[0-9]{9}$/;
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!phoneRegex.test(cleaned)) return 'Please enter a valid Israeli phone number (e.g., 050-1234567)';
  return null;
};

/**
 * Validate a full name
 * @param {string} name
 * @returns {string|null} Error message or null if valid
 */
export const validateFullName = (name) => {
  if (!name) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name must be less than 100 characters';
  return null;
};

/**
 * Validate a positive number (for financial inputs)
 * @param {number|string} value
 * @param {string} [fieldName='Value']
 * @param {boolean} [required=false]
 * @returns {string|null} Error message or null if valid
 */
export const validatePositiveNumber = (value, fieldName = 'Value', required = false) => {
  if (value === '' || value === null || value === undefined) {
    return required ? `${fieldName} is required` : null;
  }
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a valid number`;
  if (num < 0) return `${fieldName} cannot be negative`;
  return null;
};

/**
 * Validate a file for upload
 * @param {File} file
 * @returns {string|null} Error message or null if valid
 */
export const validateUploadFile = (file) => {
  if (!file) return 'Please select a file';
  const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
  if (!allowedTypes.includes(file.type)) {
    return 'Only PDF, PNG, and JPG files are allowed';
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'File size must be less than 5MB';
  }
  return null;
};

/**
 * Extract API error message from an Axios error
 * @param {Error} error - Axios error object
 * @param {string} [fallback='An error occurred'] - Fallback message
 * @returns {string}
 */
export const extractApiError = (error, fallback = 'An error occurred') => {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};
