/**
 * useFinancial hook
 * Convenience re-export from FinancialContext.
 *
 * Provides:
 *   data            — normalized financial profile (Firestore shape) | null
 *                     { id?, userId?, income, additionalIncome, expenses, assets, debts, updatedAt }
 *   isLoading       — boolean
 *   isSaving        — boolean
 *   error           — string | null
 *   saveSuccess     — boolean
 *   lastSaved       — ISO string | null
 *   fetchFinancials — async () => normalized financial data
 *   saveFinancials  — async (data) => updated normalized financial data
 *   clearError      — () => void
 *   getProfileCompletion — () => number (0-100)
 */
export { useFinancial } from '../context/FinancialContext';
