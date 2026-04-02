/**
 * UploadPage - Drag-and-drop mortgage offer upload.
 * POST /api/v1/offers (multipart/form-data)
 * GET /api/v1/offers (list recent uploads)
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import PageLayout from '../components/layout/PageLayout';
import Spinner from '../components/common/Spinner';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const { addToast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [bankName, setBankName] = useState('');
  const [recentOffers, setRecentOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const fileInputRef = useRef(null);

  const fetchRecentOffers = useCallback(async () => {
    try {
      const res = await api.get('/offers', { params: { limit: 5 } });
      setRecentOffers(res.data.data.offers || []);
    } catch {
      // Silently fail
    } finally {
      setLoadingOffers(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentOffers();
  }, [fetchRecentOffers]);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      addToast('Only PDF, PNG, and JPG files are accepted.', 'error');
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      addToast('File size must be under 5MB.', 'error');
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

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (bankName.trim()) formData.append('bankName', bankName.trim());

    setUploading(true);
    setUploadProgress(0);

    try {
      await api.post('/offers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(pct);
        },
      });

      addToast('Offer uploaded successfully! AI analysis has started.', 'success');
      setSelectedFile(null);
      setBankName('');
      setUploadProgress(0);
      fetchRecentOffers();
    } catch (err) {
      const message = err?.response?.data?.error || 'Upload failed. Please try again.';
      addToast(message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return (
        <svg className="w-8 h-8" style={{ color: '#ef4444' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17v-1h8v1H8zm0-3v-1h8v1H8zm0-3V10h5v1H8z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8" style={{ color: '#3b82f6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <PageLayout>
      <div className="page-enter max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#f8fafc' }}>
            Upload Mortgage Offer
          </h1>
          <p className="mt-1" style={{ color: '#94a3b8' }}>
            Upload your bank&apos;s mortgage offer for AI-powered analysis
          </p>
        </div>

        {/* Dropzone */}
        <div
          className={`dropzone${dragActive ? ' active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !selectedFile && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload mortgage offer file"
          onKeyDown={(e) => e.key === 'Enter' && !selectedFile && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleInputChange}
            className="hidden"
            aria-hidden="true"
          />

          {!selectedFile ? (
            <>
              <svg
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: '#334155' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium mb-1" style={{ color: '#f8fafc' }}>
                Drag &amp; drop your mortgage offer
              </p>
              <p className="text-sm mb-4" style={{ color: '#64748b' }}>
                PDF, PNG, JPG — max 5MB
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                className="px-6 py-2 text-sm font-medium transition-all"
                style={{
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#94a3b8',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#f59e0b';
                  e.currentTarget.style.color = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#334155';
                  e.currentTarget.style.color = '#94a3b8';
                }}
              >
                Browse Files
              </button>
            </>
          ) : (
            <div className="text-left" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start gap-4">
                {getFileIcon(selectedFile.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: '#f8fafc' }}>
                    {selectedFile.name}
                  </p>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    {formatFileSize(selectedFile.size)}
                  </p>
                  {uploading && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setUploadProgress(0); }}
                  aria-label="Remove file"
                  style={{ color: '#64748b' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bank Name Input */}
        {selectedFile && (
          <div className="mt-4">
            <label
              htmlFor="bankName"
              className="block text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: '#94a3b8' }}
            >
              Bank Name (optional)
            </label>
            <input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Bank Hapoalim"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                height: '44px',
                padding: '0 16px',
                width: '100%',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.2)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="w-full mt-4 flex items-center justify-center gap-2 font-semibold transition-all"
            style={{
              background: '#f59e0b',
              color: '#0f172a',
              height: '48px',
              borderRadius: '8px',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: uploading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => { if (!uploading) e.currentTarget.style.background = '#fbbf24'; }}
            onMouseLeave={(e) => { if (!uploading) e.currentTarget.style.background = '#f59e0b'; }}
          >
            {uploading ? (
              <><Spinner size={20} /><span>Uploading...</span></>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Analyze with AI</span>
              </>
            )}
          </button>
        )}

        {/* Recent Uploads */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#f8fafc' }}>
            Recent Uploads
          </h2>
          {loadingOffers ? (
            <div className="flex justify-center py-8">
              <Spinner size={32} />
            </div>
          ) : recentOffers.length === 0 ? (
            <p className="text-sm" style={{ color: '#64748b' }}>
              No offers uploaded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ background: '#1e293b', border: '1px solid #334155' }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" style={{ color: '#94a3b8' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#f8fafc' }}>
                        {offer.extractedData?.bank || offer.originalFile?.originalName || 'Offer'}
                      </p>
                      <p className="text-xs" style={{ color: '#64748b' }}>
                        {new Date(offer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={offer.status} />
                    <Link
                      to={`/analysis/${offer._id}`}
                      className="text-xs font-medium transition-colors"
                      style={{ color: '#f59e0b' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#fbbf24')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#f59e0b')}
                    >
                      View Results
                    </Link>
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

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', label: 'Pending' },
    processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6', label: 'Processing' },
    analyzed: { bg: 'rgba(16,185,129,0.1)', color: '#10b981', label: 'Analyzed' },
    error: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', label: 'Error' },
  };
  const s = styles[status] || styles.pending;
  return (
    <span
      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}
