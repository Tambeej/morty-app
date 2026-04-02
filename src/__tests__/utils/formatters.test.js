/**
 * Tests for formatting utility functions.
 */
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
  formatTerm,
  parseFormattedNumber,
} from '../../utils/formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format a number as ILS currency', () => {
      const result = formatCurrency(50000);
      expect(result).toContain('\u20aa'); // ₪ symbol
      expect(result).toContain('50');
    });

    it('should return ₪0 for null/undefined', () => {
      expect(formatCurrency(null)).toBe('\u20aa0');
      expect(formatCurrency(undefined)).toBe('\u20aa0');
    });

    it('should omit symbol when showSymbol is false', () => {
      const result = formatCurrency(1000, false);
      expect(result).not.toContain('\u20aa');
    });
  });

  describe('formatPercent', () => {
    it('should format a percentage with 2 decimal places', () => {
      expect(formatPercent(3.5)).toBe('3.50%');
    });

    it('should respect custom decimal places', () => {
      expect(formatPercent(3.5, 1)).toBe('3.5%');
    });

    it('should return 0% for null/undefined', () => {
      expect(formatPercent(null)).toBe('0%');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(2 * 1024 * 1024)).toBe('2.0 MB');
    });

    it('should return 0 B for falsy values', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });
  });

  describe('formatTerm', () => {
    it('should format months as years', () => {
      expect(formatTerm(240)).toBe('20 years');
    });

    it('should format months with remainder', () => {
      expect(formatTerm(245)).toBe('20y 5m');
    });

    it('should return empty string for falsy values', () => {
      expect(formatTerm(0)).toBe('');
    });
  });

  describe('parseFormattedNumber', () => {
    it('should parse a formatted number string', () => {
      expect(parseFormattedNumber('50,000')).toBe(50000);
    });

    it('should handle plain numbers', () => {
      expect(parseFormattedNumber('1234')).toBe(1234);
    });

    it('should return 0 for empty string', () => {
      expect(parseFormattedNumber('')).toBe(0);
    });
  });
});
