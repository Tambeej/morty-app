/**
 * Tests for formatting utility functions.
 * Covers Firestore-aligned ISO date strings and Israeli locale formatting.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
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

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('\u20aa0');
    });
  });

  describe('formatNumber', () => {
    it('should format a number with thousands separators', () => {
      const result = formatNumber(1000000);
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should return 0 for null/undefined', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
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

    it('should handle zero', () => {
      expect(formatPercent(0)).toBe('0.00%');
    });
  });

  describe('formatDate', () => {
    it('should format an ISO string to a readable date', () => {
      // Firestore timestamps are ISO strings
      const result = formatDate('2026-04-03T02:16:00.000Z');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
      // Should not be the em-dash fallback
      expect(result).not.toBe('\u2014');
    });

    it('should return em-dash for null', () => {
      expect(formatDate(null)).toBe('\u2014');
    });

    it('should return em-dash for undefined', () => {
      expect(formatDate(undefined)).toBe('\u2014');
    });

    it('should return em-dash for empty string', () => {
      expect(formatDate('')).toBe('\u2014');
    });

    it('should accept a Date object', () => {
      const result = formatDate(new Date('2026-01-15'));
      expect(typeof result).toBe('string');
      expect(result).not.toBe('\u2014');
    });

    it('should contain the year from the ISO string', () => {
      const result = formatDate('2026-04-03T02:16:00.000Z');
      expect(result).toContain('2026');
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

    it('should handle 12 months as 1 year', () => {
      expect(formatTerm(12)).toBe('1 year');
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

    it('should strip currency symbols', () => {
      expect(parseFormattedNumber('\u20aa1,200,000')).toBe(1200000);
    });
  });
});
