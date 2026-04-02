import React from 'react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="9 22 9 12 15 12 15 22" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">Morty</span>
          </div>
        </div>
        <div className="bg-navy-surface border border-border rounded-card p-8 shadow-card">
          <h1 className="text-xl font-semibold text-white mb-2">Create Account</h1>
          <p className="text-slate-400 text-sm mb-6">Join Morty for AI mortgage analysis</p>
          <p className="text-slate-500 text-sm text-center py-4">Registration form — coming in Task 2</p>
        </div>
      </div>
    </div>
  );
}
