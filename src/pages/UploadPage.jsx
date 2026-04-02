import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';

/**
 * UploadPage — placeholder for task 4 (file upload component).
 * Will be fully implemented in the next task.
 */
const UploadPage = () => (
  <PageLayout>
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Upload Mortgage Offer</h1>
        <p className="text-text-secondary mt-1">
          Upload your bank mortgage offer PDF or image for AI analysis
        </p>
      </div>
      <Card>
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-text-muted mx-auto mb-4"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-text-secondary">File upload coming soon…</p>
        </div>
      </Card>
    </div>
  </PageLayout>
);

export default UploadPage;
