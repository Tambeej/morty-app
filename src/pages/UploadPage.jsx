/**
 * Upload Page
 * Drag-and-drop file upload for mortgage offers
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../context/ToastContext';
import { uploadOffer, getOffers } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

const STATUS_BADGE = {
  analyzed: 'bg-green-400/10 text-green-400',
  pending: 'bg-yellow-400/10 text-yellow-400',
  error: 'bg-red-400/10 text-red-400',
};

function UploadPage() {
  const { t } = useTranslation();
  const { success, error: showError } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Load recent offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await getOffers();
        setRecentOffers(res.data?.offers || res.data || []);
      } catch (err) {
        // Ignore
      } finally {
        setLoadingOffers(false);
      }
    };
    fetchOffers();
  }, []);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      showError('Invalid file type. Please upload PDF, PNG, or JPG.');
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      showError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (file) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    []
  );

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await uploadOffer(formData, (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percent);
      });

      success('File uploaded successfully! Analysis in progress...');
      setSelectedFile(null);
      setUploadProgress(0);

      // Refresh offers list
      const offersRes = await getOffers();
      setRecentOffers(offersRes.data?.offers || offersRes.data || []);

      // Navigate to analysis if ID returned
      if (res.data?._id) {
        navigate(`/analysis/${res.data._id}`);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <PageLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">{t('upload.title')}</h1>
        </div>

        {/* Dropzone */}
        <Card className="mb-6">
          <div
            className={`dropzone ${isDragging ? 'active dropzone-dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload file dropzone"
            onKeyDown={(e) => e.key === 'Enter' && !selectedFile && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleInputChange}
              className="hidden"
              aria-label="File input"
            />

            {!selectedFile ? (
              <>
                <div className="flex justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-text-primary font-medium mb-1">{t('upload.dragDrop')}</p>
                <p className="text-text-muted text-sm mb-4">{t('upload.fileTypes')}</p>
                <Button variant="ghost" type="button">
                  {t('upload.browse')}
                </Button>
              </>
            ) : (
              <div className="w-full" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-4 mb-4">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium truncate">{selectedFile.name}</p>
                    <p className="text-text-muted text-sm">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-text-muted hover:text-red-400 transition-colors"
                    aria-label="Remove file"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {uploading && (
                  <ProgressBar
                    value={uploadProgress}
                    label={`${t('upload.uploading')} ${uploadProgress}%`}
                  />
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Analyze Button */}
        {selectedFile && (
          <Button
            variant="primary"
            className="w-full mb-8"
            loading={uploading}
            onClick={handleUploadAndAnalyze}
            disabled={uploading}
          >
            {uploading ? t('upload.uploading') : t('upload.analyzeBtn')}
          </Button>
        )}

        {/* Recent Uploads */}
        <div>
          <h2 className="text-base font-semibold text-text-primary mb-4">
            {t('upload.recentUploads')}
          </h2>

          {loadingOffers ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 skeleton rounded-lg" />
              ))}
            </div>
          ) : recentOffers.length === 0 ? (
            <p className="text-text-muted text-sm">No uploads yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="flex items-center justify-between p-4 bg-navy-surface border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-text-primary">
                        {offer.originalFile?.url?.split('/').pop() || 'offer.pdf'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {offer.extractedData?.bank || 'Unknown bank'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        STATUS_BADGE[offer.status] || STATUS_BADGE.pending
                      }`}
                    >
                      {offer.status === 'analyzed'
                        ? t('upload.analyzed')
                        : offer.status === 'error'
                        ? t('upload.error')
                        : t('upload.pending')}
                    </span>
                    {offer.status === 'analyzed' && (
                      <button
                        onClick={() => navigate(`/analysis/${offer._id}`)}
                        className="text-xs text-gold hover:text-gold-light font-medium transition-colors"
                      >
                        {t('upload.viewResults')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default UploadPage;
