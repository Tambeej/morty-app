import React, { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import FileIcon from '../common/FileIcon';
import ProgressBar from '../common/ProgressBar';

/** Accepted MIME types */
const ACCEPTED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const ACCEPTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Format bytes to human-readable string.
 * @param {number} bytes
 * @returns {string}
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * UploadDropzone component
 *
 * Drag-and-drop file upload zone with:
 * - Visual drag-over state (gold dashed border)
 * - File type and size validation
 * - Selected file preview with remove button
 * - Upload progress bar
 * - Accessible keyboard and screen-reader support
 *
 * @param {File|null} file - Currently selected file
 * @param {Function} onFileSelect - Callback when a valid file is selected
 * @param {Function} onFileRemove - Callback to remove the selected file
 * @param {number} uploadProgress - Upload progress 0-100 (null = not uploading)
 * @param {boolean} isUploading - Whether upload is in progress
 * @param {string|null} error - Validation or upload error message
 */
const UploadDropzone = ({
  file,
  onFileSelect,
  onFileRemove,
  uploadProgress,
  isUploading,
  error,
}) => {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  /** Validate a file and call onFileSelect or show error */
  const validateAndSelect = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
        onFileSelect(null, t('upload.dropzone.invalidType'));
        return;
      }

      if (selectedFile.size > MAX_SIZE_BYTES) {
        onFileSelect(
          null,
          t('upload.dropzone.tooLarge', { size: formatBytes(selectedFile.size) })
        );
        return;
      }

      onFileSelect(selectedFile, null);
    },
    [onFileSelect, t]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files?.[0];
      validateAndSelect(droppedFile);
    },
    [validateAndSelect]
  );

  const handleInputChange = useCallback(
    (e) => {
      const selectedFile = e.target.files?.[0];
      validateAndSelect(selectedFile);
      // Reset input so same file can be re-selected after removal
      e.target.value = '';
    },
    [validateAndSelect]
  );

  const handleBrowseClick = () => {
    inputRef.current?.click();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBrowseClick();
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleInputChange}
        className="sr-only"
        aria-label={t('upload.dropzone.ariaLabel')}
        disabled={isUploading}
      />

      {/* Drop zone */}
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          onKeyDown={handleKeyDown}
          aria-label={t('upload.dropzone.dropHere')}
          className={`
            relative flex flex-col items-center justify-center
            rounded-xl border-2 border-dashed
            px-8 py-14 text-center
            cursor-pointer select-none
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900
            ${
              isDragOver
                ? 'border-amber-500 bg-slate-700/60 scale-[1.01]'
                : 'border-slate-600 bg-slate-800/40 hover:border-amber-500/60 hover:bg-slate-700/30'
            }
          `}
        >
          {/* Upload icon */}
          <div
            className={`
              mb-4 flex h-16 w-16 items-center justify-center rounded-full
              transition-colors duration-200
              ${
                isDragOver
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-slate-700 text-slate-400'
              }
            `}
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="mb-1 text-base font-semibold text-slate-200">
            {isDragOver ? t('upload.dropzone.dropFile') : t('upload.dropzone.dragDrop')}
          </p>
          <p className="mb-5 text-sm text-slate-400">
            {t('upload.dropzone.types')}
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            className="
              rounded-lg border border-slate-500 px-5 py-2
              text-sm font-medium text-slate-300
              transition-all duration-150
              hover:border-amber-500 hover:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-amber-500
            "
          >
            {t('upload.dropzone.browse')}
          </button>
        </div>
      ) : (
        /* File preview card */
        <div className="rounded-xl border border-slate-600 bg-slate-800/60 p-5">
          <div className="flex items-start gap-4">
            {/* File type icon */}
            <div className="flex-shrink-0">
              <FileIcon
                mimetype={file.type}
                filename={file.name}
                size="lg"
              />
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-slate-100"
                title={file.name}
              >
                {file.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">
                {formatBytes(file.size)}
              </p>

              {/* Progress bar (shown while uploading) */}
              {isUploading && uploadProgress !== null && (
                <div className="mt-3">
                  <ProgressBar
                    value={uploadProgress}
                    label={t('upload.dropzone.uploading')}
                    size="md"
                    color="gold"
                  />
                </div>
              )}

              {/* Upload complete indicator */}
              {!isUploading && uploadProgress === 100 && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <svg
                    className="h-3.5 w-3.5"
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
                  {t('upload.dropzone.complete')}
                </div>
              )}
            </div>

            {/* Remove button */}
            {!isUploading && (
              <button
                type="button"
                onClick={onFileRemove}
                aria-label={t('upload.dropzone.remove', { fileName: file.name })}
                className="
                  flex-shrink-0 rounded-md p-1.5
                  text-slate-400 transition-colors duration-150
                  hover:bg-slate-700 hover:text-red-400
                  focus:outline-none focus:ring-2 focus:ring-red-500
                "
              >
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
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Validation / upload error */}
      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs text-red-400"
        >
          <svg
            className="h-3.5 w-3.5 flex-shrink-0"
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
          {error}
        </p>
      )}
    </div>
  );
};

export default UploadDropzone;
