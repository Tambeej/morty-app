import {
  isValidEmail,
  isValidIsraeliPhone,
  validatePassword,
  formatCurrency,
} from '../validators';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co.il')).toBe(true);
    expect(isValidEmail('test@test.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidIsraeliPhone', () => {
  it('accepts valid Israeli phone numbers', () => {
    expect(isValidIsraeliPhone('050-1234567')).toBe(true);
    expect(isValidIsraeliPhone('0501234567')).toBe(true);
    expect(isValidIsraeliPhone('+9725012345678')).toBe(false); // too long
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidIsraeliPhone('12345')).toBe(false);
    expect(isValidIsraeliPhone('123-456-7890')).toBe(false);
    expect(isValidIsraeliPhone('')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('Password1').valid).toBe(true);
    expect(validatePassword('securePass123').valid).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = validatePassword('Pass1');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('8 characters');
  });

  it('rejects passwords without letters', () => {
    const result = validatePassword('12345678');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('letter');
  });

  it('rejects passwords without numbers', () => {
    const result = validatePassword('PasswordOnly');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('number');
  });
});

describe('formatCurrency', () => {
  it('formats numbers with commas', () => {
    const result = formatCurrency(50000);
    expect(result).toMatch(/50[,.]?000/);
  });

  it('returns empty string for null/undefined', () => {
    expect(formatCurrency(null)).toBe('');
    expect(formatCurrency(undefined)).toBe('');
    expect(formatCurrency('')).toBe('');
  });
});
