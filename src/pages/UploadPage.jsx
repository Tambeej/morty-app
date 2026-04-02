import React, { useEffect, useState } from 'react';
import UploadDropzone from '../components/upload/UploadDropzone';
import RecentUploads from '../components/upload/RecentUploads';
import useFileUpload from '../hooks/useFileUpload';

/**
 * UploadPage
 *
 * Full-page view for uploading mortgage offer documents.
 *
 * Features:
 * - Drag-and-drop / browse file selection
 * - Optional bank name input
 * - Real-time upload progress bar
 * - Success / error feedback
 * - Recent uploads list with status badges and action buttons
 */
const UploadPage = () => {
  const {
    file,
    fileError,
    bankName,
    setBankName,
    handleFileSelect,
    handleFileRemove,
    isUploading,
    uploadProgress,
    uploadSuccess,
    uploadError,
    handleUpload,
    offers,
    offersLoading,
    offersError,
    fetchOffers,
    handleDeleteOffer,
  } = useFileUpload();

  // Fetch recent uploads on mount
  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const canUpload = !!file && !fileError && !isUploading;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Upload Mortgage Offer
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Upload your bank&apos;s mortgage offer document for AI-powered analysis.
        </p>
      </div>

      {/* Upload card */}
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 shadow-lg">
        {/* Dropzone */}
        <UploadDropzone
          file={file}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          uploadProgress={uploadProgress}
          isUploading={isUploading}
          error={fileError}
        />

        {/* Bank name input (shown after file is selected) */}
        {file && !isUploading && (
          <div className="mt-5">
            <label
              htmlFor="bankName"
              className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-slate-400"
            >
              Bank Name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="bankName"
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Bank Hapoalim"
              className="
                w-full rounded-lg border border-slate-600 bg-slate-700/60
                px-4 py-2.5 text-sm text-slate-100
                placeholder-slate-500
                transition-all duration-150
                focus:border-amber-500 focus:outline-none
                focus:ring-2 focus:ring-amber-500/30
              "
            />
          </div>
        )}

        {/* Upload error */}
        {uploadError && (
          <div
            role="alert"
            className="
              mt-4 flex items-start gap-3 rounded-lg
              border border-red-500/30 bg-red-500/10
              px-4 py-3 text-sm text-red-400
            "
          >
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        {/* Upload success */}
        {uploadSuccess && (
          <div
            role="status"
            className="
              mt-4 flex items-center gap-3 rounded-lg
              border border-emerald-500/30 bg-emerald-500/10
              px-4 py-3 text-sm text-emerald-400
            "
          >
            <svg
              className="h-4 w-4 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>
              File uploaded successfully! Our AI is now analyzing your offer.
            </span>
          </div>
        )}

        {/* Analyze button */}
        <button
          type="button"
          onClick={handleUpload}
          disabled={!canUpload}
          className="
            mt-6 flex w-full items-center justify-center gap-2
            rounded-lg bg-amber-500 px-6 py-3
            text-sm font-semibold text-slate-900
            shadow-md transition-all duration-150
            hover:bg-amber-400
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900
            disabled:cursor-not-allowed disabled:opacity-40
          "
          aria-busy={isUploading}
        >
          {isUploading ? (
            <>
              {/* Spinner */}
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              {/* AI sparkle icon */}
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Analyze with AI
            </>
          )}
        </button>

        {/* Supported formats note */}
        <p className="mt-3 text-center text-xs text-slate-500">
          Supported formats: PDF, PNG, JPG &bull; Max size: 5 MB
        </p>
      </div>

      {/* Recent uploads */}
      {offersError && (
        <p className="mt-4 text-sm text-red-400" role="alert">
          {offersError}
        </p>
      )}
      <RecentUploads
        offers={offers}
        isLoading={offersLoading}
        onDelete={handleDeleteOffer}
      />
    </div>
  );
};

export default UploadPage;
