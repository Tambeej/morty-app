/**
 * useAnalysis hook
 * Convenience re-export from AnalysisContext.
 *
 * Provides:
 *   analyses           — OfferShape[] (Firestore string IDs, ISO timestamps)
 *   currentAnalysis    — full OfferShape with analysis fields | null
 *   isLoading          — boolean
 *   isStreaming        — boolean
 *   error              — string | null
 *   fetchAnalyses      — async () => OfferShape[] (uses listOffers internally)
 *   fetchAnalysis      — async (id: string) => full OfferShape
 *   triggerReanalysis  — async (id: string) => void (re-fetches + starts streaming)
 *   startStreaming     — (id: string) => void
 *   stopStreaming      — () => void
 *   clearCurrentAnalysis — () => void
 *   clearError         — () => void
 *
 * Note: The current API contract does not include a dedicated list or reanalyze endpoint.
 * fetchAnalyses uses GET /offers; triggerReanalysis re-fetches and starts SSE streaming.
 */
export { useAnalysis } from '../context/AnalysisContext';
