import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/common/Card';

/**
 * AnalysisPage — placeholder for task 5 (analysis results display).
 * Will be fully implemented in the next task.
 */
const AnalysisPage = () => {
  const { id } = useParams();

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Analysis Results</h1>
          <p className="text-text-secondary mt-1">Offer ID: {id}</p>
        </div>
        <Card goldTopBorder>
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-text-muted mx-auto mb-4"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-text-secondary">Analysis results coming soon…</p>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AnalysisPage;
