/**
 * Mortgage offers service module.
 *
 * Handles file upload and listing of offers.
 * Aligned with Firestore backend API contract:
 *   GET  /offers       → { data: OfferShape[] }
 *   POST /offers       → { data: { id: string, status: 'pending' } }
 *
 * OfferShape:
 * {
 *   id: string,
 *   userId: string,
 *   originalFile: { url: string, mimetype: string },
 *   extractedData: { bank?: string, amount?: number, rate?: number, term?: number },
 *   analysis: { recommendedRate?: number, savings?: number, aiReasoning?: string },
 *   status: 'pending' | 'analyzed' | 'error',
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO)
 * }
 */
import api from './api';

/**
 * Normalize an offer object from the API response.
 * Ensures string IDs (Firestore) and safe defaults for optional fields.
 * @param {object} offer - Raw offer from API
 * @returns {object} Normalized offer
 */
export const normalizeOffer = (offer) => ({
  id: offer.id || offer._id || '',
  userId: offer.userId || '',
  originalFile: {
    url: offer.originalFile?.url || '',
    mimetype: offer.originalFile?.mimetype || '',
  },
  extractedData: {
    bank: offer.extractedData?.bank || null,
    amount: offer.extractedData?.amount ?? null,
    rate: offer.extractedData?.rate ?? null,
    term: offer.extractedData?.term ?? null,
  },
  analysis: offer.analysis
    ? {
        recommendedRate: offer.analysis.recommendedRate ?? null,
        savings: offer.analysis.savings ?? null,
        aiReasoning: offer.analysis.aiReasoning || null,
      }
    : null,
  status: offer.status || 'pending',
  createdAt: offer.createdAt || null,
  updatedAt: offer.updatedAt || null,
});

/**
 * Upload a mortgage offer file.
 * @param {File} file - The PDF/PNG/JPG file
 * @param {Function} [onUploadProgress] - Progress callback (percent: number) => void
 * @returns {Promise<{ id: string, status: string }>} Created offer stub
 */
export const uploadOffer = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/offers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percent);
      }
    },
  });

  // Backend returns { data: { id: string, status: 'pending' } }
  const payload = response.data?.data || response.data;
  return payload;
};

/**
 * List all offers for the current user (sorted by createdAt desc).
 * @returns {Promise<object[]>} Array of normalized OfferShape objects
 */
export const listOffers = async () => {
  const response = await api.get('/offers');
  // Backend returns { data: OfferShape[] }
  const payload = response.data?.data || response.data;
  const offers = Array.isArray(payload) ? payload : (payload?.offers || []);
  return offers.map(normalizeOffer);
};

/**
 * Get a single offer by ID (via analysis endpoint).
 * Note: The new API contract exposes individual offers via GET /analysis/:id.
 * Use analysisService.getAnalysis(id) for full offer details.
 * @param {string} id - Offer ID
 * @returns {Promise<object>} Normalized offer object
 */
export const getOffer = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  const payload = response.data?.data || response.data;
  return normalizeOffer(payload);
};
