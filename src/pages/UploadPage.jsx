/**
 * UploadPage.jsx
 * Drag-and-drop file upload for mortgage offer PDFs/images.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/validators';
import Spinner from '../components/common/Spinner';
import Skeleton from '../components/common/Skeleton';
import PageLayout from '../components/layout/PageLayout';

const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const UploadPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [recentOffers, setRecentOffers] = useState([]);
  const [offersLoading, setOffersLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    setOffersLoading(true);
    try {
      const res = await api.get('/offers?limit=5');
      setRecentOffers(res.data.data.offers || []);
    } catch (err) {
      addToast(extractApiError(err, 'Failed to load recent offers'), 'error');
    } finally {
      setOffersLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      addToast('Only PDF, PNG, and JPG files are accepted.', 'error');
      return false;
    }
    if (file.size > MAX_SIZE_BYTES) {
      addToast('File size must be under 5 MB.', 'error');
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

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [] // eslint-disable-line
  );

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/offers', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      addToast('Offer uploaded! AI analysis has started.', 'success');
      setSelectedFile(null);
      setUploadProgress(0);
      fetchOffers();
      const offerId = res.data?.data?.offer?._id;
      if (offerId) navigate(`/analysis/${offerId}`);
    } catch (err) {
      addToast(extractApiError(err, 'Upload failed. Please try again.'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            Upload Mortgage Offer
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '6px' }}>PDF, PNG, JPG — max 5 MB</p>
        </div>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drop zone for mortgage offer file"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#f59e0b' : '#334155'}`,
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            background: dragOver ? '#273549' : 'transparent',
            cursor: 'pointer',
            transition: 'all 200ms',
            marginBottom: '24px',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📤</div>
          <p style={{ color: '#f8fafc', fontSize: '1rem', fontWeight: 500, marginBottom: '4px' }}>
            Drag & drop your mortgage offer
          </p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '16px' }}>
            PDF, PNG, JPG — max 5 MB
          </p>
          <span
            style={{
              display: 'inline-block',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '8px 20px',
              color: '#94a3b8',
              fontSize: '0.875rem',
              pointerEvents: 'none',
            }}
          >
            Browse Files
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
        </div>

        {/* Selected file preview */}
        {selectedFile && (
          <div
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {selectedFile.type === 'application/pdf' ? '📄' : '🖼️'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f8fafc', fontSize: '0.9375rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>{formatSize(selectedFile.size)}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadProgress(0); }}
                aria-label="Remove file"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', fontSize: '1rem', padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {uploading && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Uploading...</span>
                  <span style={{ color: '#f59e0b', fontSize: '0.8125rem' }}>{uploadProgress}%</span>
                </div>
                <div style={{ height: '4px', background: '#334155', borderRadius: '2px' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${uploadProgress}%`,
                      background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                      borderRadius: '2px',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          style={{
            width: '100%',
            height: '48px',
            background: !selectedFile || uploading ? '#f59e0b66' : '#f59e0b',
            color: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: !selectedFile || uploading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '40px',
          }}
        >
          {uploading ? (
            <><Spinner size={18} color="#0f172a" /> Analyzing with AI...</>
          ) : (
            'Analyze with AI'
          )}
        </button>

        {/* Recent uploads */}
        <div>
          <h2 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 600, marginBottom: '16px' }}>
            Recent Uploads
          </h2>
          {offersLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => <Skeleton key={i} height="52px" borderRadius="8px" />)}
            </div>
          ) : recentOffers.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No uploads yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentOffers.map((offer) => (
                <div
                  key={offer._id}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>📄</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#f8fafc', fontSize: '0.875rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {offer.originalFile?.originalName || offer.extractedData?.bank || 'Offer'}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {new Date(offer.createdAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background:
                        offer.status === 'analyzed' ? 'rgba(16,185,129,0.15)'
                        : offer.status === 'error' ? 'rgba(239,68,68,0.15)'
                        : 'rgba(245,158,11,0.15)',
                      color:
                        offer.status === 'analyzed' ? '#10b981'
                        : offer.status === 'error' ? '#ef4444'
                        : '#f59e0b',
                    }}
                  >
                    {offer.status}
                  </span>
                  {offer.status === 'analyzed' && (
                    <button
                      onClick={() => navigate(`/analysis/${offer._id}`)}
                      style={{
                        background: 'none',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '4px 12px',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      View Results
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default UploadPage;
