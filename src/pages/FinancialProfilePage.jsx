import React from 'react';
import PageLayout from '../components/layout/PageLayout';

export default function FinancialProfilePage() {
  return (
    <PageLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Financial Profile</h1>
        <p className="text-slate-400 mb-8">Keep this updated for accurate analysis</p>
        <p className="text-slate-500 text-sm text-center py-8">Financial data form — coming in Task 3</p>
      </div>
    </PageLayout>
  );
}
