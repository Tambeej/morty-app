import React from 'react';

/**
 * FileIcon component
 * Renders an appropriate icon based on file MIME type or extension.
 *
 * @param {string} [mimetype] - MIME type of the file
 * @param {string} [filename] - Filename (used as fallback for extension detection)
 * @param {string} [className] - Additional CSS classes
 * @param {'sm'|'md'|'lg'} [size='md'] - Icon size
 */
const FileIcon = ({ mimetype, filename, className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const isPdf =
    mimetype === 'application/pdf' ||
    (filename && filename.toLowerCase().endsWith('.pdf'));

  const isImage =
    mimetype?.startsWith('image/') ||
    (filename &&
      /\.(png|jpg|jpeg|gif|webp)$/i.test(filename));

  if (isPdf) {
    return (
      <svg
        className={`${sizeMap[size]} ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="PDF file"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          fill="#ef4444"
          opacity="0.15"
        />
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6"
          stroke="#ef4444"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="12"
          y="17"
          textAnchor="middle"
          fontSize="5"
          fontWeight="700"
          fill="#ef4444"
          fontFamily="Inter, system-ui"
        >
          PDF
        </text>
      </svg>
    );
  }

  if (isImage) {
    return (
      <svg
        className={`${sizeMap[size]} ${className}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Image file"
      >
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          fill="#3b82f6"
          opacity="0.15"
        />
        <path
          d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="13" r="1.5" fill="#3b82f6" />
        <path
          d="M6 18l3-4 2.5 3 2-2.5 4.5 3.5H6z"
          fill="#3b82f6"
          opacity="0.7"
        />
      </svg>
    );
  }

  // Generic file icon
  return (
    <svg
      className={`${sizeMap[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="File"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        fill="#94a3b8"
        opacity="0.15"
      />
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 2v6h6"
        stroke="#94a3b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default FileIcon;
