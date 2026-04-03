/**
 * firestoreUtils.test.js
 * Comprehensive tests for Firestore ID and timestamp normalization utilities.
 * Uses Vitest (vi) — aligned with the project's test setup.
 */
import { describe, it, expect } from 'vitest';
import {
  isFirestoreTimestamp,
  normalizeId,
  normalizeTimestamp,
  normalizeFirestoreDoc,
  normalizeUserDoc,
  normalizeOfferDoc,
  normalizeFinancialDoc,
  normalizeDocArray,
  getDisplayId,
} from '../../utils/firestoreUtils';

// ─── Mock Firestore Timestamp ─────────────────────────────────────────────────

/**
 * Creates a mock Firestore Timestamp object (as returned by client SDK).
 */
function createMockTimestamp(isoString) {
  const date = new Date(isoString);
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
    toDate: () => date,
  };
}

// ─── Test Data ────────────────────────────────────────────────────────────────

const ISO_DATE = '2026-04-03T02:16:00.000Z';
const FIRESTORE_ID = 'firestore-uid-abc123';
const LEGACY_ID = '507f1f77bcf86cd799439011';

const mockFirestoreUser = {
  id: FIRESTORE_ID,
  email: 'test@morty.co.il',
  phone: '050-0000000',
  verified: true,
};

const mockLegacyUser = {
  _id: LEGACY_ID,
  email: 'legacy@example.com',
  phone: '052-1234567',
  verified: false,
};

const mockOffer = {
  id: 'offer-id-xyz',
  userId: FIRESTORE_ID,
  originalFile: { url: 'https://cdn.example.com/file.pdf', mimetype: 'application/pdf' },
  extractedData: { bank: 'הפועלים', amount: 1200000, rate: 3.5, term: 240 },
  analysis: { recommendedRate: 3.1, savings: 45000, aiReasoning: 'שיעור טוב יותר זמין.' },
  status: 'analyzed',
  createdAt: ISO_DATE,
  updatedAt: ISO_DATE,
};

// ─── isFirestoreTimestamp ─────────────────────────────────────────────────────

describe('isFirestoreTimestamp', () => {
  it('returns true for a Firestore Timestamp object', () => {
    const ts = createMockTimestamp(ISO_DATE);
    expect(isFirestoreTimestamp(ts)).toBe(true);
  });

  it('returns false for an ISO string', () => {
    expect(isFirestoreTimestamp(ISO_DATE)).toBe(false);
  });

  it('returns false for a Date object', () => {
    expect(isFirestoreTimestamp(new Date())).toBe(false);
  });

  it('returns false for null', () => {
    expect(isFirestoreTimestamp(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isFirestoreTimestamp(undefined)).toBe(false);
  });

  it('returns false for a plain object without toDate', () => {
    expect(isFirestoreTimestamp({ seconds: 1234567890 })).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isFirestoreTimestamp(1234567890)).toBe(false);
  });
});

// ─── normalizeId ──────────────────────────────────────────────────────────────

describe('normalizeId', () => {
  it('returns string id from Firestore document', () => {
    expect(normalizeId({ id: FIRESTORE_ID })).toBe(FIRESTORE_ID);
  });

  it('falls back to _id for legacy MongoDB documents', () => {
    expect(normalizeId({ _id: LEGACY_ID })).toBe(LEGACY_ID);
  });

  it('prefers id over _id when both are present', () => {
    expect(normalizeId({ id: FIRESTORE_ID, _id: LEGACY_ID })).toBe(FIRESTORE_ID);
  });

  it('returns empty string when no id fields', () => {
    expect(normalizeId({})).toBe('');
  });

  it('returns empty string for null', () => {
    expect(normalizeId(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(normalizeId(undefined)).toBe('');
  });

  it('converts non-string id to string', () => {
    // Firestore IDs are always strings, but handle edge cases
    expect(normalizeId({ id: 12345 })).toBe('12345');
  });
});

// ─── normalizeTimestamp ───────────────────────────────────────────────────────

describe('normalizeTimestamp', () => {
  it('returns ISO string unchanged when valid', () => {
    expect(normalizeTimestamp(ISO_DATE)).toBe(ISO_DATE);
  });

  it('converts a Date object to ISO string', () => {
    const date = new Date(ISO_DATE);
    expect(normalizeTimestamp(date)).toBe(date.toISOString());
  });

  it('converts a Firestore Timestamp object to ISO string', () => {
    const ts = createMockTimestamp(ISO_DATE);
    const result = normalizeTimestamp(ts);
    expect(typeof result).toBe('string');
    expect(result).not.toBeNull();
    // Should be a valid ISO date string
    expect(new Date(result).getFullYear()).toBe(2026);
  });

  it('converts a serialized Firestore Timestamp (seconds only) to ISO string', () => {
    const seconds = Math.floor(new Date(ISO_DATE).getTime() / 1000);
    const result = normalizeTimestamp({ seconds });
    expect(typeof result).toBe('string');
    expect(result).not.toBeNull();
  });

  it('returns null for null', () => {
    expect(normalizeTimestamp(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(normalizeTimestamp(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeTimestamp('')).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(normalizeTimestamp('not-a-date')).toBeNull();
  });

  it('returns null for invalid Date object', () => {
    expect(normalizeTimestamp(new Date('invalid'))).toBeNull();
  });
});

// ─── normalizeFirestoreDoc ────────────────────────────────────────────────────

describe('normalizeFirestoreDoc', () => {
  it('normalizes id and timestamps', () => {
    const doc = {
      id: FIRESTORE_ID,
      name: 'Test',
      createdAt: ISO_DATE,
      updatedAt: ISO_DATE,
    };
    const result = normalizeFirestoreDoc(doc);
    expect(result.id).toBe(FIRESTORE_ID);
    expect(result.createdAt).toBe(ISO_DATE);
    expect(result.updatedAt).toBe(ISO_DATE);
    expect(result.name).toBe('Test');
  });

  it('normalizes Firestore Timestamp objects in createdAt/updatedAt', () => {
    const ts = createMockTimestamp(ISO_DATE);
    const doc = { id: FIRESTORE_ID, createdAt: ts, updatedAt: ts };
    const result = normalizeFirestoreDoc(doc);
    expect(typeof result.createdAt).toBe('string');
    expect(typeof result.updatedAt).toBe('string');
  });

  it('handles legacy _id', () => {
    const doc = { _id: LEGACY_ID, createdAt: ISO_DATE };
    const result = normalizeFirestoreDoc(doc);
    expect(result.id).toBe(LEGACY_ID);
  });

  it('returns doc unchanged if null', () => {
    expect(normalizeFirestoreDoc(null)).toBeNull();
  });
});

// ─── normalizeUserDoc ─────────────────────────────────────────────────────────

describe('normalizeUserDoc', () => {
  it('normalizes a Firestore user (string id)', () => {
    const result = normalizeUserDoc(mockFirestoreUser);
    expect(result.id).toBe(FIRESTORE_ID);
    expect(result.email).toBe('test@morty.co.il');
    expect(result.phone).toBe('050-0000000');
    expect(result.verified).toBe(true);
  });

  it('normalizes a legacy MongoDB user (_id)', () => {
    const result = normalizeUserDoc(mockLegacyUser);
    expect(result.id).toBe(LEGACY_ID);
    expect(result.email).toBe('legacy@example.com');
    expect(result.verified).toBe(false);
  });

  it('provides safe defaults for missing fields', () => {
    const result = normalizeUserDoc({ id: 'uid-1' });
    expect(result.email).toBe('');
    expect(result.phone).toBe('');
    expect(result.verified).toBe(false);
  });

  it('returns null for null input', () => {
    expect(normalizeUserDoc(null)).toBeNull();
  });

  it('preserves optional name field', () => {
    const result = normalizeUserDoc({ id: 'uid-1', email: 'a@b.com', name: 'Yoav Cohen' });
    expect(result.name).toBe('Yoav Cohen');
  });

  it('does not include name field when absent', () => {
    const result = normalizeUserDoc(mockFirestoreUser);
    expect(result).not.toHaveProperty('name');
  });
});

// ─── normalizeOfferDoc ────────────────────────────────────────────────────────

describe('normalizeOfferDoc', () => {
  it('normalizes a complete analyzed offer', () => {
    const result = normalizeOfferDoc(mockOffer);
    expect(result.id).toBe('offer-id-xyz');
    expect(result.status).toBe('analyzed');
    expect(result.createdAt).toBe(ISO_DATE);
    expect(result.updatedAt).toBe(ISO_DATE);
    expect(result.extractedData.bank).toBe('הפועלים');
    expect(result.extractedData.amount).toBe(1200000);
    expect(result.analysis.savings).toBe(45000);
    expect(result.analysis.recommendedRate).toBe(3.1);
    expect(result.analysis.aiReasoning).toBe('שיעור טוב יותר זמין.');
  });

  it('handles pending offer with null analysis', () => {
    const pendingOffer = {
      id: 'offer-pending',
      status: 'pending',
      createdAt: ISO_DATE,
      extractedData: null,
      analysis: null,
    };
    const result = normalizeOfferDoc(pendingOffer);
    expect(result.id).toBe('offer-pending');
    expect(result.status).toBe('pending');
    expect(result.analysis).toBeNull();
    // extractedData should have safe defaults
    expect(result.extractedData.bank).toBeNull();
    expect(result.extractedData.amount).toBeNull();
  });

  it('normalizes Firestore Timestamp in createdAt', () => {
    const ts = createMockTimestamp(ISO_DATE);
    const offer = { ...mockOffer, createdAt: ts };
    const result = normalizeOfferDoc(offer);
    expect(typeof result.createdAt).toBe('string');
    expect(result.createdAt).not.toBeNull();
  });

  it('defaults status to pending when missing', () => {
    const result = normalizeOfferDoc({ id: 'offer-1' });
    expect(result.status).toBe('pending');
  });

  it('normalizes legacy _id to id', () => {
    const offer = { _id: 'legacy-offer-id', status: 'analyzed', createdAt: ISO_DATE };
    const result = normalizeOfferDoc(offer);
    expect(result.id).toBe('legacy-offer-id');
  });

  it('returns null for null input', () => {
    expect(normalizeOfferDoc(null)).toBeNull();
  });

  it('initializes recommendations as empty array when missing', () => {
    const offer = { id: 'offer-1', analysis: { savings: 1000 } };
    const result = normalizeOfferDoc(offer);
    expect(result.analysis.recommendations).toEqual([]);
  });

  it('preserves recommendations array', () => {
    const offer = {
      id: 'offer-1',
      analysis: { recommendations: ['Rec 1', 'Rec 2'] },
    };
    const result = normalizeOfferDoc(offer);
    expect(result.analysis.recommendations).toEqual(['Rec 1', 'Rec 2']);
  });
});

// ─── normalizeFinancialDoc ────────────────────────────────────────────────────

describe('normalizeFinancialDoc', () => {
  it('normalizes a complete financial document', () => {
    const financial = {
      id: 'fin-id-1',
      userId: FIRESTORE_ID,
      income: 15000,
      additionalIncome: 2000,
      expenses: { housing: 3000, loans: 1000, other: 500 },
      assets: { savings: 50000, investments: 100000 },
      debts: [{ type: 'car', amount: 20000 }],
      updatedAt: ISO_DATE,
    };
    const result = normalizeFinancialDoc(financial);
    expect(result.id).toBe('fin-id-1');
    expect(result.income).toBe(15000);
    expect(result.expenses.housing).toBe(3000);
    expect(result.assets.savings).toBe(50000);
    expect(result.debts).toHaveLength(1);
    expect(result.updatedAt).toBe(ISO_DATE);
  });

  it('provides safe defaults for null input', () => {
    const result = normalizeFinancialDoc(null);
    expect(result.income).toBe(0);
    expect(result.additionalIncome).toBe(0);
    expect(result.expenses).toEqual({ housing: 0, loans: 0, other: 0 });
    expect(result.assets).toEqual({ savings: 0, investments: 0 });
    expect(result.debts).toEqual([]);
  });

  it('provides safe defaults for missing nested fields', () => {
    const result = normalizeFinancialDoc({ id: 'fin-1', income: 10000 });
    expect(result.additionalIncome).toBe(0);
    expect(result.expenses.housing).toBe(0);
    expect(result.assets.savings).toBe(0);
    expect(result.debts).toEqual([]);
  });

  it('normalizes Firestore Timestamp in updatedAt', () => {
    const ts = createMockTimestamp(ISO_DATE);
    const result = normalizeFinancialDoc({ id: 'fin-1', updatedAt: ts });
    expect(typeof result.updatedAt).toBe('string');
  });
});

// ─── normalizeDocArray ────────────────────────────────────────────────────────

describe('normalizeDocArray', () => {
  it('normalizes an array of documents', () => {
    const docs = [
      { id: 'doc-1', createdAt: ISO_DATE },
      { id: 'doc-2', createdAt: ISO_DATE },
    ];
    const result = normalizeDocArray(docs, normalizeFirestoreDoc);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('doc-1');
    expect(result[1].id).toBe('doc-2');
  });

  it('filters out null results', () => {
    const docs = [null, { id: 'doc-1' }, undefined];
    const result = normalizeDocArray(docs, (d) => d ? normalizeFirestoreDoc(d) : null);
    expect(result).toHaveLength(1);
  });

  it('returns empty array for non-array input', () => {
    expect(normalizeDocArray(null, normalizeFirestoreDoc)).toEqual([]);
    expect(normalizeDocArray(undefined, normalizeFirestoreDoc)).toEqual([]);
    expect(normalizeDocArray('not-array', normalizeFirestoreDoc)).toEqual([]);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeDocArray([], normalizeFirestoreDoc)).toEqual([]);
  });
});

// ─── getDisplayId ─────────────────────────────────────────────────────────────

describe('getDisplayId', () => {
  it('truncates long IDs', () => {
    const result = getDisplayId('offer-id-abc123xyz', 8);
    expect(result).toBe('offer-id...');
  });

  it('returns full ID when shorter than maxLength', () => {
    expect(getDisplayId('abc', 8)).toBe('abc');
  });

  it('returns full ID when equal to maxLength', () => {
    expect(getDisplayId('12345678', 8)).toBe('12345678');
  });

  it('returns empty string for null/undefined', () => {
    expect(getDisplayId(null)).toBe('');
    expect(getDisplayId(undefined)).toBe('');
    expect(getDisplayId('')).toBe('');
  });

  it('uses default maxLength of 8', () => {
    const result = getDisplayId('abcdefghijklmnop');
    expect(result).toBe('abcdefgh...');
  });
});
