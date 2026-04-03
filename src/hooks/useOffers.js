/**
 * useOffers hook
 * Convenience re-export from OffersContext.
 *
 * Provides:
 *   offers          — OfferShape[] (Firestore string IDs, ISO timestamps)
 *   isLoading       — boolean
 *   isUploading     — boolean
 *   uploadProgress  — number (0-100)
 *   error           — string | null
 *   uploadError     — string | null
 *   fetchOffers     — async () => OfferShape[]
 *   uploadNewOffer  — async (file: File, onProgress?: Function) => { id, status }
 *   removeOffer     — (id: string) => void  (local state only)
 *   clearError      — () => void
 *   clearUploadError — () => void
 *
 * OfferShape:
 *   { id: string, userId, originalFile, extractedData, analysis, status, createdAt, updatedAt }
 */
export { useOffers } from '../context/OffersContext';
