import React from 'react';
import PageLayout from '../components/layout/PageLayout';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <PageLayout>
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
        <p className="text-slate-400 mb-8">Here's your mortgage analysis summary</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Best Rate', 'Potential Savings', 'Active Offers'].map((title) => (
            <div key={title} className="bg-navy-surface border border-border rounded-card p-6 shadow-card">
              <p className="text-sm text-slate-400 mb-2">{title}</p>
              <p className="text-2xl font-bold text-white">—</p>
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm mt-8 text-center">Dashboard charts and data — coming in Task 3</p>
      </div>
    </PageLayout>
  );
}
