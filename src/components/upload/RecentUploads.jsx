import React from 'react';
import { useNavigate } from 'react-router-dom';
import FileIcon from '../common/FileIcon';
import { formatDate } from '../../utils/formatters';

/**
 * Status badge component for offer status.
 * Color scheme aligned with Firestore migration design:
 * - pending  → yellow
 * - analyzed → green
 * - error    → red
 * - processing → blue
 */
const StatusBadge = ({ status }) => {
  const config = {
    pending: {
      label: 'Pending',
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    processing: {
      label: 'Processing',
      classes: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    },
    analyzed: {
      label: 'Analyzed',
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    error: {
      label: 'Error',
      classes: 'bg-red-500/15 text-red-400 border-red-500/30',
    },
  };

  const { label, classes } = config[status] || config.pending;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${classes}`}
    >
      {status === 'processing' && (
        <span
          className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400"
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
};

/**
 * RecentUploads component
 *
 * Displays a list of recently uploaded mortgage offer files with their
 * status and a link to view analysis results.
 *
 * Uses offer.id (Firestore string ID) for keys and navigation.
 * Supports backward-compat with offer._id (legacy MongoDB ObjectId).
 *
 * @param {Array} offers - Array of offer objects from the API
 * @param {boolean} isLoading - Whether offers are being fetched
 * @param {Function} onDelete - Callback to delete an offer by id
 */
const RecentUploads = ({ offers = [], isLoading, onDelete }) => {
  const navigate = useNavigate();

  /**
   * Get the offer ID — supports both Firestore string id and legacy _id.
   * @param {object} offer
   * @returns {string}
   */
  const getOfferId = (offer) => offer.id || offer._id;

  if (isLoading) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Recent Uploads
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-slate-800"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="mt-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
          Recent Uploads
        </h3>
        <p className="text-sm text-slate-500">No uploads yet. Upload your first mortgage offer above.</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
        Recent Uploads
      </h3>
      <ul className="space-y-3" role="list" aria-label="Recent mortgage offer uploads">
        {offers.map((offer) => {
          const offerId = getOfferId(offer);
          const filename =
            offer.originalFile?.originalName ||
            offer.originalFile?.url?.split('/').pop() ||
            'offer.pdf';
          const mimetype = offer.originalFile?.mimetype || 'application/pdf';

          return (
            <li
              key={offerId}
              className="
                flex items-center gap-4 rounded-xl
                border border-slate-700 bg-slate-800/60
                px-4 py-3
                transition-all duration-200
                hover:border-slate-600
              "
            >
              {/* File icon */}
              <FileIcon mimetype={mimetype} filename={filename} size="sm" />

              {/* File info */}
              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium text-slate-200"
                  title={filename}
                >
                  {filename}
                </p>
                {offer.extractedData?.bank && (
                  <p className="text-xs text-slate-400">{offer.extractedData.bank}</p>
                )}
                {offer.createdAt && (
                  <p className="text-xs text-slate-500">{formatDate(offer.createdAt)}</p>
                )}
              </div>

              {/* Status badge */}
              <StatusBadge status={offer.status} />

              {/* Actions */}
              <div className="flex items-center gap-2">
                {offer.status === 'analyzed' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/analysis/${offerId}`)}
                    className="
                      rounded-lg border border-amber-500/40 px-3 py-1.5
                      text-xs font-medium text-amber-400
                      transition-all duration-150
                      hover:border-amber-500 hover:bg-amber-500/10
                      focus:outline-none focus:ring-2 focus:ring-amber-500
                    "
                  >
                    View Results
                  </button>
                )}

                {(offer.status === 'pending' || offer.status === 'error') && (
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(offerId)}
                    aria-label={`Delete ${filename}`}
                    className="
                      rounded-md p-1.5 text-slate-500
                      transition-colors duration-150
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
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentUploads;
