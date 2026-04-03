/**
 * firestoreUtils.js
 *
 * Utilities for handling Firestore-specific data shapes in the frontend.
 *
 * Key differences from Mongoose/MongoDB:
 *   - IDs: Firestore uses string IDs (`id`), not ObjectIds (`_id`)
 *   - Timestamps: Firestore Admin SDK returns ISO strings; client SDK returns
 *     Timestamp objects with `.toDate()`. This module handles both.
 *   - All documents have `createdAt` / `updatedAt` as ISO strings from the backend.
 *
 * Usage:
 *   import { normalizeId, normalizeTimestamp, normalizeOfferDoc } from '../utils/firestoreUtils';
 */

// ─── Type Guards ─────────────────────────────────────────────────────────────

/**
 * Check if a value is a Firestore Timestamp object.
 * Firestore Timestamp objects have a `.toDate()` method and `.seconds` / `.nanoseconds` fields.
 *
 * @param {*} value
 * @returns {boolean}
 */
export function isFirestoreTimestamp(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.toDate === 'function' &&
    typeof value.seconds === 'number'
  );
}

// ─── ID Normalization ─────────────────────────────────────────────────────────

/**
 * Normalize a document ID from Firestore or legacy MongoDB.
 *
 * Firestore uses string `id`; MongoDB used ObjectId `_id`.
 * This function provides a backward-compatible shim.
 *
 * @param {object} doc - Document object from API
 * @returns {string} Normalized string ID, or empty string if not found
 *
 * @example
 *   normalizeId({ id: 'abc123' })          // → 'abc123'
 *   normalizeId({ _id: '507f1f77bcf86cd' }) // → '507f1f77bcf86cd'
 *   normalizeId({})                         // → ''
 */
export function normalizeId(doc) {
  if (!doc) return '';
  return String(doc.id || doc._id || '');
}

// ─── Timestamp Normalization ──────────────────────────────────────────────────

/**
 * Normalize a timestamp value to an ISO string.
 *
 * Handles:
 *   - Firestore Timestamp objects (from client SDK): `{ seconds, nanoseconds, toDate() }`
 *   - ISO strings (from backend Admin SDK): `'2026-04-03T02:16:00.000Z'`
 *   - JavaScript Date objects
 *   - null / undefined → returns null
 *
 * @param {object|string|Date|null|undefined} value - Raw timestamp value
 * @returns {string|null} ISO string, or null if falsy/invalid
 *
 * @example
 *   normalizeTimestamp('2026-04-03T02:16:00.000Z')  // → '2026-04-03T02:16:00.000Z'
 *   normalizeTimestamp(new Date('2026-04-03'))        // → '2026-04-03T00:00:00.000Z'
 *   normalizeTimestamp({ seconds: 1743645360, nanoseconds: 0, toDate: () => new Date(1743645360000) })
 *                                                     // → '2025-04-03T...'
 *   normalizeTimestamp(null)                          // → null
 */
export function normalizeTimestamp(value) {
  if (value === null || value === undefined) return null;

  // Firestore Timestamp object (client SDK)
  if (isFirestoreTimestamp(value)) {
    try {
      return value.toDate().toISOString();
    } catch {
      return null;
    }
  }

  // Already an ISO string
  if (typeof value === 'string') {
    if (!value) return null;
    // Validate it's a parseable date string
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : value;
  }

  // JavaScript Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value.toISOString();
  }

  // Firestore-like object with seconds (e.g., serialized Timestamp)
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    try {
      return new Date(value.seconds * 1000).toISOString();
    } catch {
      return null;
    }
  }

  return null;
}

// ─── Document Normalization ───────────────────────────────────────────────────

/**
 * Normalize a generic Firestore document.
 * Ensures `id` is a string and `createdAt`/`updatedAt` are ISO strings.
 *
 * @param {object} doc - Raw document from API
 * @returns {object} Document with normalized id and timestamps
 */
export function normalizeFirestoreDoc(doc) {
  if (!doc) return doc;
  return {
    ...doc,
    id: normalizeId(doc),
    createdAt: normalizeTimestamp(doc.createdAt),
    updatedAt: normalizeTimestamp(doc.updatedAt),
  };
}

/**
 * Normalize a user document from Firestore.
 *
 * Firestore user shape:
 *   { id: string, email: string, phone: string, verified: boolean }
 *
 * Provides backward-compat shim for legacy `_id` field.
 *
 * @param {object} user - Raw user from API response
 * @returns {{ id: string, email: string, phone: string, verified: boolean }}
 */
export function normalizeUserDoc(user) {
  if (!user) return null;
  return {
    id: normalizeId(user),
    email: user.email || '',
    phone: user.phone || '',
    verified: Boolean(user.verified),
    // Preserve any extra fields (e.g., name, displayName)
    ...(user.name ? { name: user.name } : {}),
    ...(user.displayName ? { displayName: user.displayName } : {}),
  };
}

/**
 * Normalize a mortgage offer document from Firestore.
 *
 * Ensures:
 *   - `id` is a string (not `_id`)
 *   - `createdAt` / `updatedAt` are ISO strings
 *   - Nested `extractedData` and `analysis` have safe null defaults
 *   - `status` defaults to 'pending'
 *
 * @param {object} offer - Raw offer from API
 * @returns {object} Normalized offer with Firestore-aligned shape
 *
 * @example
 *   normalizeOfferDoc({
 *     id: 'offer-xyz',
 *     status: 'analyzed',
 *     createdAt: '2026-04-03T02:16:00.000Z',
 *     extractedData: { bank: 'הפועלים', amount: 1200000, rate: 3.5, term: 240 },
 *     analysis: { recommendedRate: 3.1, savings: 45000, aiReasoning: 'Good rate.' },
 *   })
 */
export function normalizeOfferDoc(offer) {
  if (!offer) return null;

  return {
    id: normalizeId(offer),
    userId: offer.userId || '',
    originalFile: {
      url: offer.originalFile?.url || '',
      mimetype: offer.originalFile?.mimetype || '',
      originalName: offer.originalFile?.originalName || null,
    },
    extractedData: {
      bank: offer.extractedData?.bank ?? null,
      amount: offer.extractedData?.amount ?? null,
      rate: offer.extractedData?.rate ?? null,
      term: offer.extractedData?.term ?? null,
      monthlyPayment: offer.extractedData?.monthlyPayment ?? null,
    },
    // Null-guard: analysis may be null if offer is still pending
    analysis: offer.analysis
      ? {
          recommendedRate: offer.analysis.recommendedRate ?? null,
          savings: offer.analysis.savings ?? null,
          aiReasoning: offer.analysis.aiReasoning ?? null,
          monthlyPayment: offer.analysis.monthlyPayment ?? null,
          totalCost: offer.analysis.totalCost ?? null,
          totalInterest: offer.analysis.totalInterest ?? null,
          marketAverageRate: offer.analysis.marketAverageRate ?? null,
          rateVsMarket: offer.analysis.rateVsMarket ?? null,
          debtToIncomeRatio: offer.analysis.debtToIncomeRatio ?? null,
          affordabilityScore: offer.analysis.affordabilityScore ?? null,
          recommendations: Array.isArray(offer.analysis.recommendations)
            ? offer.analysis.recommendations
            : [],
        }
      : null,
    status: offer.status || 'pending',
    createdAt: normalizeTimestamp(offer.createdAt),
    updatedAt: normalizeTimestamp(offer.updatedAt),
  };
}

/**
 * Normalize a financial profile document from Firestore.
 *
 * Ensures all nested objects have safe numeric defaults.
 * Firestore financial shape:
 *   { id, userId, income, additionalIncome, expenses: {housing, loans, other},
 *     assets: {savings, investments}, debts: [], updatedAt: ISO }
 *
 * @param {object|null} financial - Raw financial data from API
 * @returns {object} Normalized financial data with safe defaults
 */
export function normalizeFinancialDoc(financial) {
  if (!financial) {
    return {
      income: 0,
      additionalIncome: 0,
      expenses: { housing: 0, loans: 0, other: 0 },
      assets: { savings: 0, investments: 0 },
      debts: [],
    };
  }

  return {
    id: normalizeId(financial),
    userId: financial.userId || '',
    income: financial.income ?? 0,
    additionalIncome: financial.additionalIncome ?? 0,
    expenses: {
      housing: financial.expenses?.housing ?? 0,
      loans: financial.expenses?.loans ?? 0,
      other: financial.expenses?.other ?? 0,
    },
    assets: {
      savings: financial.assets?.savings ?? 0,
      investments: financial.assets?.investments ?? 0,
    },
    debts: Array.isArray(financial.debts) ? financial.debts : [],
    updatedAt: normalizeTimestamp(financial.updatedAt),
  };
}

/**
 * Normalize an array of Firestore documents.
 * Filters out null/undefined entries.
 *
 * @param {Array} docs - Array of raw documents
 * @param {Function} normalizeFn - Normalization function to apply to each doc
 * @returns {Array} Array of normalized documents
 */
export function normalizeDocArray(docs, normalizeFn) {
  if (!Array.isArray(docs)) return [];
  return docs.map(normalizeFn).filter(Boolean);
}

/**
 * Get a display-friendly ID string.
 * Truncates long Firestore IDs for display purposes.
 *
 * @param {string} id - Firestore document ID
 * @param {number} [maxLength=8] - Maximum display length
 * @returns {string} Truncated ID with ellipsis, or full ID if short enough
 *
 * @example
 *   getDisplayId('offer-id-abc123xyz')  // → 'offer-id...'
 *   getDisplayId('abc')                  // → 'abc'
 */
export function getDisplayId(id, maxLength = 8) {
  if (!id) return '';
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}...`;
}
