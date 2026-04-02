/**
 * Upload Page
 * File upload component for mortgage offer documents
 */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { uploadOffer, getOffers } from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import ProgressBar from '../components/common/ProgressBar';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Upload Page Component
 */
const UploadPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  // Load recent offers
  React.useEffect(() => {
    const loadOffers = async () => {
      try {
        const response = await getOffers();
        setRecentOffers(response.data?.offers || []);
      } catch {
        setRecentOffers([]);
      } finally {
        setLoadingOffers(false);
      }
    };
    loadOffers();
  }, []);

  /**
   * Validate file type and size
   */
  const validateFile = useCallback(
    (file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, PNG, or JPG files.');
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error('File too large. Maximum size is 5MB.');
        return false;
      }
      return true;
    },
    [toast]
  );

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(
    (file) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        setUploadProgress(0);
      }
    },
    [validateFile]
  );

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  /**
   * Upload file to backend
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await uploadOffer(formData, (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(progress);
      });

      toast.success('Offer uploaded successfully! Analysis in progress...');
      setSelectedFile(null);
      setUploadProgress(0);

      // Navigate to analysis page
      if (response.data?.offerId) {
        navigate(`/analysis/${response.data.offerId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Upload failed. Please try again.'
      );
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8 text-error" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#f8fafc] mb-1">
          Upload Mortgage Offer
        </h1>
        <p className="text-[#94a3b8]">
          Upload your bank's mortgage offer for AI-powered analysis
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="mb-6">
        {!selectedFile ? (
          <div
            className={`dropzone ${isDragOver ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Upload file area. Click or drag and drop a file here."
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-navy-elevated rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-[#64748b]"
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
              <div>
                <p className="text-[#f8fafc] font-medium mb-1">
                  Drag & drop your mortgage offer
                </p>
                <p className="text-sm text-[#94a3b8]">
                  PDF, PNG, JPG — max 5MB
                </p>
              </div>
              <Button variant="ghost" type="button">
                Browse Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleInputChange}
              className="hidden"
              aria-label="File input"
            />
          </div>
        ) : (
          <div className="p-4">
            {/* File Preview */}
            <div className="flex items-center gap-4 p-4 bg-navy-elevated rounded-lg mb-4">
              {getFileIcon(selectedFile.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#f8fafc] truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[#94a3b8]">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {!isUploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-[#64748b] hover:text-error transition-colors"
                  aria-label="Remove file"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4">
                <ProgressBar
                  value={uploadProgress}
                  label="Upload progress"
                  showLabel
                />
                <p className="text-xs text-[#94a3b8] mt-1 text-center">
                  Uploading...
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              variant="primary"
              onClick={handleUpload}
              loading={isUploading}
              disabled={isUploading}
              className="w-full"
            >
              Analyze with AI
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Uploads */}
      <Card>
        <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">
          Recent Uploads
        </h2>

        {loadingOffers ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-12 shimmer rounded" />
            ))}
          </div>
        ) : recentOffers.length === 0 ? (
          <p className="text-[#94a3b8] text-sm py-4 text-center">
            No uploads yet. Upload your first mortgage offer above.
          </p>
        ) : (
          <div className="space-y-3">
            {recentOffers.slice(0, 5).map((offer) => (
              <div
                key={offer._id}
                className="flex items-center gap-4 p-3 bg-navy-elevated rounded-lg"
              >
                <svg
                  className="w-5 h-5 text-[#64748b] flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f8fafc] truncate">
                    {offer.originalFile?.url?.split('/').pop() || 'offer.pdf'}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    offer.status === 'analyzed'
                      ? 'bg-success/10 text-success'
                      : offer.status === 'error'
                      ? 'bg-error/10 text-error'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {offer.status === 'analyzed'
                    ? 'Analyzed'
                    : offer.status === 'error'
                    ? 'Error'
                    : 'Pending'}
                </span>
                {offer.status === 'analyzed' && (
                  <a
                    href={`/analysis/${offer._id}`}
                    className="text-xs text-gold hover:text-gold-light transition-colors"
                  >
                    View Results
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </PageLayout>
  );
};

export default UploadPage;
