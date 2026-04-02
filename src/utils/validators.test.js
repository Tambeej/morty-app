/**
 * Validator Utility Tests
 */
import {
  isValidIsraeliPhone,
  isValidEmail,
  formatCurrency,
  formatNumber,
  calculateMonthlyPayment,
  calculateTotalInterest,
  formatFileSize,
} from './validators';

describe('isValidIsraeliPhone', () => {
  it('validates +972 format', () => {
    expect(isValidIsraeliPhone('+972501234567')).toBe(true);
  });

  it('validates 0 prefix format', () => {
    expect(isValidIsraeliPhone('0501234567')).toBe(true);
  });

  it('rejects invalid phone', () => {
    expect(isValidIsraeliPhone('123')).toBe(false);
    expect(isValidIsraeliPhone('abcdefghij')).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('validates correct email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.user+tag@domain.co.il')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
  });
});

describe('calculateMonthlyPayment', () => {
  it('calculates correct monthly payment', () => {
    // 1,200,000 ILS at 3.8% for 25 years
    const payment = calculateMonthlyPayment(1200000, 3.8, 25);
    expect(payment).toBeGreaterThan(6000);
    expect(payment).toBeLessThan(7000);
  });

  it('handles zero interest rate', () => {
    const payment = calculateMonthlyPayment(120000, 0, 10);
    expect(payment).toBeCloseTo(1000, 0);
  });
});

describe('calculateTotalInterest', () => {
  it('calculates total interest correctly', () => {
    const monthlyPayment = 6200;
    const termYears = 25;
    const principal = 1200000;
    const totalInterest = calculateTotalInterest(monthlyPayment, termYears, principal);
    expect(totalInterest).toBeGreaterThan(0);
    expect(totalInterest).toBe(monthlyPayment * termYears * 12 - principal);
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
