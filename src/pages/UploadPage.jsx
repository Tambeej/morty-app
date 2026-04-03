import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiService } from '../services/api.js';
import { formatDate } from '../utils/formatters.js';
import PageLayout from '../components/layout/PageLayout.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Spinner from '../components/common/Spinner.jsx';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_MB = 5;

/**
 * File upload page for mortgage offer documents.
 * Uses offer.id (Firestore string ID) for keys and navigation links.
 */
export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recentOffers, setRecentOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  useEffect(() => {
    apiService
      .getOffers()
      .then(setRecentOffers)
      .catch(() => {})
      .finally(() => setLoadingOffers(false));
  }, []);

  function validateFile(f) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error('Only PDF, PNG, and JPG files are accepted.');
      return false;
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File must be smaller than ${MAX_SIZE_MB}MB.`);
      return false;
    }
    return true;
  }

  function handleFileSelect(f) {
    if (f && validateFile(f)) setFile(f);
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileSelect(dropped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragActive(false), []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const result = await apiService.uploadOffer(file, setUploadProgress);
      toast.success('Offer uploaded! AI analysis started.');
      setFile(null);
      setUploadProgress(0);
      setRecentOffers((prev) => [result, ...prev]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  function formatSize(bytes) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Get the offer ID — supports both Firestore string id and legacy _id.
   * @param {object} offer
   * @returns {string}
   */
  function getOfferId(offer) {
    return offer.id || offer._id;
  }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#f8fafc]">Upload Mortgage Offer</h1>
          <p className="text-[#94a3b8] mt-1">Upload your bank&apos;s mortgage offer for AI analysis</p>
        </div>

        {/* Dropzone */}
        <Card className="mb-6">
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            role="region"
            aria-label="File upload dropzone"
          >
            <div className="flex flex-col items-center gap-4">
              <span className="text-5xl" aria-hidden="true">📤</span>
              <div className="text-center">
                <p className="text-[#f8fafc] font-medium">Drag &amp; drop your mortgage offer</p>
                <p className="text-[#64748b] text-sm mt-1">PDF, PNG, JPG — max {MAX_SIZE_MB}MB</p>
              </div>
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-2 border border-border text-[#94a3b8] hover:border-gold hover:text-[#f8fafc] px-5 py-2.5 rounded-input text-sm font-medium transition-all duration-150">
                  Browse Files
                </span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="sr-only"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  aria-label="Select file"
                />
              </label>
            </div>
          </div>

          {/* Selected file preview */}
          {file && (
            <div className="mt-4 p-4 bg-navy-elevated rounded-input border border-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    {file.type === 'application/pdf' ? '📄' : '🖼️'}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-[#f8fafc]">{file.name}</p>
                    <p className="text-xs text-[#64748b]">{formatSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setFile(null); setUploadProgress(0); }}
                  className="text-[#64748b] hover:text-red-400 transition-colors"
                  aria-label="Remove file"
                >
                  ✕
                </button>
              </div>

              {uploading && (
                <div>
                  <ProgressBar value={uploadProgress} label="Upload progress" />
                  <p className="text-xs text-[#64748b] mt-1 text-right">{uploadProgress}% Uploading...</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          loading={uploading}
          className="w-full mb-8"
        >
          Analyze with AI
        </Button>

        {/* Recent uploads */}
        <Card>
          <h2 className="text-lg font-semibold text-[#f8fafc] mb-4">Recent Uploads</h2>
          {loadingOffers ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : recentOffers.length === 0 ? (
            <p className="text-[#64748b] text-sm text-center py-4">No uploads yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentOffers.map((offer) => {
                const offerId = getOfferId(offer);
                return (
                  <div
                    key={offerId}
                    className="flex items-center justify-between p-3 bg-navy-elevated rounded-input border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true">📄</span>
                      <div>
                        <p className="text-sm text-[#f8fafc]">
                          {offer.originalFile?.url?.split('/').pop() || 'offer.pdf'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            offer.status === 'analyzed'
                              ? 'bg-green-100/10 text-green-400 border-green-200/20'
                              : offer.status === 'error'
                              ? 'bg-red-100/10 text-red-400 border-red-200/20'
                              : 'bg-yellow-100/10 text-yellow-400 border-yellow-200/20'
                          }`}>
                            {offer.status === 'analyzed' ? 'Analyzed' :
                             offer.status === 'error'    ? 'Error' : 'Pending'}
                          </span>
                          {offer.createdAt && (
                            <span className="text-xs text-[#64748b]">
                              {formatDate(offer.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {offer.status === 'analyzed' && (
                      <Link
                        to={`/analysis/${offerId}`}
                        className="text-gold hover:text-gold-light text-xs font-medium"
                      >
                        View Results →
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
}
