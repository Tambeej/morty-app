import { useState, useCallback } from 'react';
import { offersApi } from '../services/offersApi';

/**
 * useFileUpload hook
 *
 * Manages the full lifecycle of a mortgage offer file upload:
 * - File selection and validation state
 * - Upload progress tracking via XMLHttpRequest
 * - Success / error state
 * - Offer list fetching and deletion
 *
 * @returns {object} Upload state and handlers
 */
const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [bankName, setBankName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [offers, setOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState(null);

  /** Handle file selection from dropzone */
  const handleFileSelect = useCallback((selectedFile, validationError) => {
    setFile(selectedFile);
    setFileError(validationError);
    setUploadProgress(null);
    setUploadSuccess(false);
    setUploadError(null);
  }, []);

  /** Remove the selected file */
  const handleFileRemove = useCallback(() => {
    setFile(null);
    setFileError(null);
    setUploadProgress(null);
    setUploadSuccess(false);
    setUploadError(null);
  }, []);

  /**
   * Upload the selected file to the backend.
   * Uses XMLHttpRequest for progress tracking.
   */
  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      await offersApi.uploadOffer(
        file,
        bankName || undefined,
        (progress) => setUploadProgress(progress)
      );

      setUploadProgress(100);
      setUploadSuccess(true);

      // Refresh offers list after successful upload
      fetchOffers();

      // Reset file after short delay so user sees 100%
      setTimeout(() => {
        setFile(null);
        setUploadProgress(null);
        setIsUploading(false);
      }, 1500);
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Upload failed. Please try again.';
      setUploadError(message);
      setUploadProgress(null);
      setIsUploading(false);
    }
  }, [file, bankName]);

  /** Fetch the user's offer list */
  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    setOffersError(null);
    try {
      const data = await offersApi.getOffers();
      setOffers(data.offers || []);
    } catch (err) {
      setOffersError(
        err?.response?.data?.error || 'Failed to load recent uploads.'
      );
    } finally {
      setOffersLoading(false);
    }
  }, []);

  /** Delete an offer by id */
  const handleDeleteOffer = useCallback(
    async (offerId) => {
      try {
        await offersApi.deleteOffer(offerId);
        setOffers((prev) => prev.filter((o) => o._id !== offerId));
      } catch (err) {
        console.error('Failed to delete offer:', err);
      }
    },
    []
  );

  return {
    // File state
    file,
    fileError,
    bankName,
    setBankName,
    handleFileSelect,
    handleFileRemove,

    // Upload state
    isUploading,
    uploadProgress,
    uploadSuccess,
    uploadError,
    handleUpload,

    // Offers list
    offers,
    offersLoading,
    offersError,
    fetchOffers,
    handleDeleteOffer,
  };
};

export default useFileUpload;
