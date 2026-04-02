import React from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../components/layout/PageLayout';

export default function AnalysisPage() {
  const { id } = useParams();
  return (
    <PageLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Analysis Results</h1>
        <p className="text-slate-400 mb-8">Offer ID: {id}</p>
        <p className="text-slate-500 text-sm text-center py-8">Analysis results display — coming in Task 5</p>
      </div>
    </PageLayout>
  );
}
