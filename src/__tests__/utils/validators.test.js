/**
 * Tests for validation utility functions.
 */
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateIsraeliPhone,
  validateFullName,
  validatePositiveNumber,
  validateUploadFile,
  extractApiError,
} from '../../utils/validators';

describe('Validators', () => {
  describe('validateEmail', () => {
    it('should return null for valid email', () => {
      expect(validateEmail('user@example.com')).toBeNull();
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('not-an-email')).toBeTruthy();
    });
  });

  describe('validatePassword', () => {
    it('should return null for valid password', () => {
      expect(validatePassword('Password1')).toBeNull();
    });

    it('should return error for short password', () => {
      expect(validatePassword('Pass1')).toBeTruthy();
    });

    it('should return error for password without uppercase', () => {
      expect(validatePassword('password1')).toBeTruthy();
    });

    it('should return error for password without number', () => {
      expect(validatePassword('Password')).toBeTruthy();
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });
  });

  describe('validatePasswordMatch', () => {
    it('should return null when passwords match', () => {
      expect(validatePasswordMatch('Password1', 'Password1')).toBeNull();
    });

    it('should return error when passwords do not match', () => {
      expect(validatePasswordMatch('Password1', 'Password2')).toBeTruthy();
    });

    it('should return error for empty confirm password', () => {
      expect(validatePasswordMatch('Password1', '')).toBeTruthy();
    });
  });

  describe('validateIsraeliPhone', () => {
    it('should return null for valid Israeli phone', () => {
      expect(validateIsraeliPhone('0501234567')).toBeNull();
    });

    it('should return null for +972 format', () => {
      expect(validateIsraeliPhone('+972501234567')).toBeNull();
    });

    it('should return error for invalid phone', () => {
      expect(validateIsraeliPhone('123')).toBeTruthy();
    });

    it('should return error for empty phone', () => {
      expect(validateIsraeliPhone('')).toBe('Phone number is required');
    });
  });

  describe('validatePositiveNumber', () => {
    it('should return null for valid positive number', () => {
      expect(validatePositiveNumber(1000)).toBeNull();
    });

    it('should return null for zero', () => {
      expect(validatePositiveNumber(0)).toBeNull();
    });

    it('should return error for negative number', () => {
      expect(validatePositiveNumber(-100)).toBeTruthy();
    });

    it('should return null for empty non-required field', () => {
      expect(validatePositiveNumber('', 'Income', false)).toBeNull();
    });

    it('should return error for empty required field', () => {
      expect(validatePositiveNumber('', 'Income', true)).toBeTruthy();
    });
  });

  describe('validateUploadFile', () => {
    it('should return null for valid PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(validateUploadFile(file)).toBeNull();
    });

    it('should return null for valid PNG file', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      expect(validateUploadFile(file)).toBeNull();
    });

    it('should return error for invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      expect(validateUploadFile(file)).toBeTruthy();
    });

    it('should return error for file over 5MB', () => {
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
      expect(validateUploadFile(file)).toBeTruthy();
    });

    it('should return error for null file', () => {
      expect(validateUploadFile(null)).toBe('Please select a file');
    });
  });

  describe('extractApiError', () => {
    it('should extract error from response.data.error', () => {
      const err = { response: { data: { error: 'Invalid credentials' } } };
      expect(extractApiError(err)).toBe('Invalid credentials');
    });

    it('should extract error from response.data.message', () => {
      const err = { response: { data: { message: 'Not found' } } };
      expect(extractApiError(err)).toBe('Not found');
    });

    it('should extract error from error.message', () => {
      const err = { message: 'Network error' };
      expect(extractApiError(err)).toBe('Network error');
    });

    it('should return fallback for unknown error', () => {
      expect(extractApiError({}, 'Custom fallback')).toBe('Custom fallback');
    });
  });
});
