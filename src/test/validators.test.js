import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, formatCurrency, parseCurrency, validateUploadFile } from '../utils/validators';

describe('loginSchema', () => {
  it('validates correct login data', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'Password123' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'Password123' });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({ email: 'user@example.com', password: 'short' });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validData = { name: 'Yoav Cohen', email: 'yoav@example.com', phone: '0521234567', password: 'Password123', confirmPassword: 'Password123' };

  it('validates correct registration data', () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...validData, confirmPassword: 'DifferentPassword123' });
    expect(result.success).toBe(false);
  });

  it('validates Israeli phone format', () => {
    ['0521234567', '+972521234567', '0541234567'].forEach((phone) => {
      expect(registerSchema.safeParse({ ...validData, phone }).success).toBe(true);
    });
  });

  it('rejects invalid phone format', () => {
    expect(registerSchema.safeParse({ ...validData, phone: '1234567890' }).success).toBe(false);
  });

  it('requires uppercase in password', () => {
    expect(registerSchema.safeParse({ ...validData, password: 'password123', confirmPassword: 'password123' }).success).toBe(false);
  });
});

describe('formatCurrency', () => {
  it('formats numbers with commas', () => {
    expect(formatCurrency(1234567)).toBe('1,234,567');
  });

  it('returns empty string for null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
  });

  it('handles zero', () => {
    expect(formatCurrency(0)).toBe('0');
  });
});

describe('parseCurrency', () => {
  it('parses formatted currency string', () => {
    expect(parseCurrency('1,234,567')).toBe(1234567);
  });

  it('returns 0 for empty string', () => {
    expect(parseCurrency('')).toBe(0);
  });
});

describe('validateUploadFile', () => {
  it('accepts valid PDF file', () => {
    const file = new File(['content'], 'offer.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 });
    expect(validateUploadFile(file).valid).toBe(true);
  });

  it('rejects invalid file type', () => {
    const file = new File(['content'], 'offer.txt', { type: 'text/plain' });
    const result = validateUploadFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('rejects file over 5MB', () => {
    const file = new File(['content'], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 6 * 1024 * 1024 });
    const result = validateUploadFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('too large');
  });
});
